<?php

namespace App\Controllers;

use App\Models\TransactionModel;
use App\Models\ActivityLogModel;
use App\Models\UserModel;
use App\Helpers\JwtHelper;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;
use PhpParser\Builder\Function_;

class TransactionsController extends ResourceController
{
  protected $modelName = 'App\Models\TransactionModel';
  protected $format    = 'json';
  protected $db;

  public function __construct()
  {
    $this->db = \Config\Database::connect();
  }

  public function createTransaction()
  {
    $input = $this->request->getJSON(true);
    if (!$input) {
      return $this->fail("Invalid JSON Format", 400);
    }

    $isReseller = !empty($input['is_reseller']);
    $discountInfo = $this->calculateResellerDiscount($input['transaction_details'], $isReseller);
    $discountAmount = $discountInfo['discount'];

    $totalBeforeDiscount = 0;
    foreach ($input['transaction_details'] as $detail) {
      $totalBeforeDiscount += ((int) $detail['price'] * (int) $detail['quantity']);
    }
    $totalPrice = max(0, $totalBeforeDiscount - $discountAmount);

    $cashAmount = $input['cash_amount'] ?? null;
    $changeAmount = $input['change_amount'] ?? null;
    if (($input['payment_method'] ?? '') === 'cash' && $cashAmount !== null) {
      $changeAmount = (int) $cashAmount - $totalPrice;
    }

    // Generate transaction code
    $now = new \DateTime();
    $randomNumber = str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT);
    $transaction_code = sprintf("CAB01%s%02d", $now->format('dmyHi'), $randomNumber);

    // Prepare Transaction data
    $transactionData = [
      'user_id'          => $input['user_id'],
      'transaction_code' =>  $transaction_code,
      'total_price' => $totalPrice,
      'payment_method' => $input['payment_method'],
      'is_online_order' => $input['is_online_order'],
      'cash_amount' => $cashAmount,
      'change_amount' => $changeAmount,
      'created_at' => date('Y-m-d H:i:s')
    ];

    // Add Customer data if is_online_order === 1
    if ($input['is_online_order'] === 1) {
      $transactionData['customer_name'] = $input['customer_name'] ?? null;
      $transactionData['customer_address'] = $input['customer_address'] ?? null;
      $transactionData['customer_phone'] = $input['customer_phone'] ?? null;
      $transactionData['notes'] = $input['notes'] ?? null;
    }

    $this->db->transStart();

    // Insert Transaction data actions
    $this->db->table('transactions')->insert($transactionData);
    $transaction_id = $this->db->insertID();

    if (!$transaction_id) {
      $this->db->transRollback();
      return $this->fail('Failed to create transaction', 500);
    }

    // Insert transaction_details
    $transaction_details = [];
    foreach ($input['transaction_details'] as $detail) {
      $transaction_details[] = [
        'transaction_id' => $transaction_id,
        'product_id' => $detail['product_id'],
        'quantity' => $detail['quantity'],
        'price' => $detail['price'],
        'subtotal' => ($detail['price'] * $detail['quantity']),
        'created_at' => date('Y-m-d H:i:s')
      ];
    }

    $this->db->table('transaction_details')->insertBatch($transaction_details);

    $this->db->transComplete();

    if ($this->db->transStatus() === false) {
      return $this->fail('Transaction Failed, please try again', 500);
    }

    return $this->respond([
      'message' => 'Transaction created Successfully',
      'transaction_code' => $transaction_code
    ]);
  }

  public function get_receipt()
  {
    $input = $this->request->getJSON(true);
    $transaction_code = $input['transaction_code'];

    if (!$input) {
      return $this->fail("Invalid JSON Format", 400);
    }

    if (!$transaction_code) {
      return $this->fail('Transaction code is required', 400);
    }

    // Ambil data transaksi utama
    $transaction = $this->db->table('transactions')
      ->select('transactions.*, users.username as cashier')
      ->join('users', 'users.id = transactions.user_id')
      ->where('transactions.transaction_code', $transaction_code)
      ->get()
      ->getRowArray();

    if (!$transaction) {
      return $this->failNotFound('Transaction not found');
    }

    // Ambil detail transaksi
    $transaction_details = $this->db->table('transaction_details')
      ->select('transaction_details.*, products.name as product_name')
      ->join('products', 'products.id = transaction_details.product_id')
      ->where('transaction_details.transaction_id', $transaction['id'])
      ->get()
      ->getResultArray();

    // Format data produk
    $products = array_map(function ($detail) {
      return [
        'product_name' => $detail['product_name'],
        'quantity' => (int) $detail['quantity'],
        'price' => (int) $detail['price'],
        'subtotal' => (int) $detail['subtotal'],
      ];
    }, $transaction_details);

    $totalBeforeDiscount = array_sum(array_map(function ($detail) {
      return (int) $detail['subtotal'];
    }, $transaction_details));
    $discountInfo = $this->calculateResellerDiscount($transaction_details, true);
    $maxDiscount = max(0, $totalBeforeDiscount - (int) $transaction['total_price']);
    $discountAmount = min($discountInfo['discount'], $maxDiscount);

    // Format response
    $data = [
      'transaction_code' => $transaction['transaction_code'],
      'cashier' => $transaction['cashier'],
      'products' => $products,
      'total_price' => (int) $transaction['total_price'],
      'discount_amount' => (int) $discountAmount,
      'cash_amount' => (int) $transaction['cash_amount'],
      'change_amount' => (int) $transaction['change_amount'],
      'is_online_order' => (int) $transaction['is_online_order'],
      'customer_name' => $transaction['customer_name'] ?? '',
      'customer_address' => $transaction['customer_address'] ?? '',
      'customer_phone' => $transaction['customer_phone'] ?? '',
      'notes' => $transaction['notes'] ?? '',
      'tanggal' => date('d-m-Y', strtotime($transaction['created_at']))
    ];

    return $this->respond([
      'status' => 'success',
      'data'   => $data
    ]);
  }

  private function calculateResellerDiscount(array $transactionDetails, bool $isReseller): array
  {
    if (!$isReseller) {
      return [
        'discount' => 0,
        'total_grams' => 0,
      ];
    }

    $variantGrams = [];
    $totalGrams = 0;

    foreach ($transactionDetails as $detail) {
      $quantity = (int) ($detail['quantity'] ?? 0);
      $unitGrams = (int) ($detail['weight_grams'] ?? 500);
      $productId = (string) ($detail['product_id'] ?? '');
      $grams = $quantity * $unitGrams;
      $variantGrams[$productId] = ($variantGrams[$productId] ?? 0) + $grams;
      $totalGrams += $grams;
    }

    if ($totalGrams < 3000 || $totalGrams % 500 !== 0) {
      return [
        'discount' => 0,
        'total_grams' => $totalGrams,
      ];
    }

    $discount = 0;
    $mixGrams = 0;
    foreach ($variantGrams as $grams) {
      $fullKg = intdiv($grams, 1000);
      $discount += $fullKg * 5000;
      $mixGrams += $grams % 1000;
    }

    $mixedKg = intdiv($mixGrams, 1000);
    $discount += $mixedKg * 3000;

    return [
      'discount' => $discount,
      'total_grams' => $totalGrams,
    ];
  }


  private function createLog($action, $details = null)
  {
    $jwtHelper = new JwtHelper();
    $logModel  = new ActivityLogModel();
    $request   = service('request');
    $authHeader = $request->getHeaderLine('Authorization');

    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
      $token   = $matches[1];
      $decoded = $jwtHelper->validateJWT($token);
      if ($decoded) {
        $logModel->logActivity($decoded['id'], $decoded['username'], $action, $details);
      }
    }
  }

  // GET /transactions
  public function index()
  {
    try {

      $db = \Config\Database::connect();
      $builder = $db->table('transactions');
      $builder->select('transactions.transaction_code, users.username AS kasir, transactions.total_price, transactions.date_time');
      $builder->join('users', 'users.id = transactions.user_id');

      // Ambil param username
      $username = $this->request->getGet('username');
      if (!empty($username)) {
        $builder->where('users.username', $username);
      }

      // Ambil param start_date dan end_date
      $startDate = $this->request->getGet('start_date');
      $endDate   = $this->request->getGet('end_date');

      if (!empty($startDate)) {
        if ($startDate === 'today') {
          $today = date('Y-m-d');
          $builder->where('DATE(transactions.date_time)', $today);
        } else {
          $builder->where('DATE(transactions.date_time) >=', $startDate);
        }
      }

      if (!empty($endDate)) {
        $builder->where('DATE(transactions.date_time) <=', $endDate);
      }

      // Ambil param branch
      $branchId = $this->request->getGet('branch');
      if (!empty($branchId)) {
        $builder->where('transactions.branch_id', $branchId);
      }

      $query = $builder->get();
      $results = $query->getResultArray();

      if (empty($results)) {
        $this->createLog('READ_ALL_TRANSACTIONS', 'Tidak ada data transaksi.');
        return $this->failNotFound('Tidak ada data transaksi.');
      }

      // Format hasil untuk ambil date dan time dari kolom date_time
      $formatted = [];
      foreach ($results as $row) {
        $dateTime = new \DateTime($row['date_time']);
        $formatted[] = [
          'transaction_code' => $row['transaction_code'],
          'kasir'            => $row['kasir'],
          'date'             => $dateTime->format('Y-m-d'),
          'time'             => $dateTime->format('H:i'),
          'total_price'      => $row['total_price'],
        ];
      }

      $this->createLog('READ_ALL_TRANSACTIONS', ['SUCCESS']);
      return $this->respond([
        'status' => 'success',
        'data'   => $formatted,
      ]);
    } catch (Exception $e) {
      $this->createLog('READ_ALL_TRANSACTIONS', ['ERROR']);
      return Services::response()
        ->setJSON([
          'status'  => 'error',
          'message' => 'Terjadi kesalahan pada server.',
          'error'   => $e->getMessage()
        ])
        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }
  }


  // GET /transactions/{id}
  public function show($transactions_code = null)
  {
    try {

      $db = \Config\Database::connect();
      $builder = $db->table('transactions');
      $builder->select('*');
      $builder->where('transaction_code', $transactions_code);
      $transaction = $builder->get()->getRowArray();


      if (!$transaction) {
        $this->createLog("SHOW_TRANSACTION", ['ERROR: Transaksi tidak ditemukan.']);
        return $this->failNotFound('Transaksi tidak ditemukan.');
      }

      // Ambil transaction_id berdasarkan transaction_id
      $builderDetail = $db->table('transaction_details');
      $builderDetail->select('
	    transaction_details.transaction_id,
	    transaction_details.product_id,
	    products.name AS product_name,
	    transaction_details.quantity,
	    transaction_details.price,
	    transaction_details.subtotal
      ');
      $builderDetail->join('products', 'products.id = transaction_details.product_id', 'left');
      $builderDetail->where('transaction_id', $transaction['id']);
      $details = $builderDetail->get()->getResultArray();

      // Gabungkan Hasil
      $result = [
        'transactions'        => $transaction,
        'transaction_details' => $details
      ];


      $this->createLog("SHOW_TRANSACTION", ['SUCCESS']);
      return $this->respond([
        'status' => 'success',
        'data'   => $result
      ]);
    } catch (Exception $e) {
      $this->createLog('SHOW_TRANSACTION', ['ERROR']);
      return Services::response()
        ->setJSON([
          'status'  => 'error',
          'message' => 'Terjadi kesalahan pada server.',
          'error'   => $e->getMessage()
        ])
        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  // POST /transactions
  public function create()
  {
    $db = \Config\Database::connect();
    $transactionModel = new \App\Models\TransactionModel();
    $transactionDetailsModel = new \App\Models\TransactionDetailsModel();

    $data = $this->request->getJSON(true);

    // Validasi awal
    if (!isset($data['transaction']) || !isset($data['transaction_details'])) {
      return $this->failValidationErrors('Data transaksi atau detail transaksi tidak ditemukan.');
    }

    $transaction = $data['transaction'];
    $details = $data['transaction_details'];

    $rules = [
      'transaction_code' => 'required|is_unique[transactions.transaction_code]',
      'user_id'          => 'required|integer',
      'branch_id'        => 'required|integer',
      'date_time'        => 'required',
      'total_price'      => 'required|decimal',
      'cash_amount'      => 'required|decimal',
      'change_amount'    => 'required|decimal',
      'payment_method'   => 'required',
      'is_online_order'  => 'required',
    ];

    if (!$this->validateData($transaction, $rules)) {
      return $this->failValidationErrors($this->validator->getErrors());
    }

    // Siapkan data transaksi
    $transactionData = [
      'transaction_code' => $transaction['transaction_code'],
      'user_id'          => $transaction['user_id'],
      'branch_id'        => $transaction['branch_id'],
      'date_time'        => $transaction['date_time'],
      'total_price'      => $transaction['total_price'],
      'cash_amount'      => $transaction['cash_amount'],
      'change_amount'    => $transaction['change_amount'],
      'payment_method'   => $transaction['payment_method'],
      'is_online_order'  => $transaction['is_online_order'] ?? 0,
      'customer_name'    => $transaction['customer_name'] ?? '',
      'customer_address' => $transaction['customer_address'] ?? '',
      'customer_phone'   => $transaction['customer_phone'] ?? '',
      'notes'            => $transaction['notes'] ?? '',
    ];

    // Mulai database transaction
    $db->transBegin();

    try {
      // Simpan transaksi utama
      $transactionModel->insert($transactionData);
      $transactionId = $transactionModel->getInsertID();

      // Simpan detail transaksi
      foreach ($details as $item) {
        $transactionDetailsModel->insert([
          'transaction_id' => $transactionId,
          'product_id'     => $item['product_id'],
          'quantity'       => $item['quantity'],
          'price'          => $item['price'],
          'subtotal'       => $item['subtotal'],
        ]);
      }

      // Jika semua berhasil
      if ($db->transStatus() === false) {
        $db->transRollback();
        $this->createLog("CREATE_TRANSACTION", ['ERROR']);
        return $this->failServerError('Gagal menyimpan transaksi.');
      }

      $db->transCommit();
      $this->createLog("CREATE_TRANSACTION", ['SUCCESS']);
      return $this->respondCreated([
        'status'  => 'success',
        'message' => 'Transaksi berhasil disimpan',
        'data'    => [
          'transaction_id' => $transactionId,
          'transaction' => $transactionData,
          'details'     => $details
        ]
      ]);
    } catch (\Throwable $e) {
      $db->transRollback();
      $this->createLog("CREATE_TRANSACTION", ['EXCEPTION']);
      return $this->failServerError($e->getMessage());
    }
  }


  // DELETE /transactions/{id}
  public function delete($id = null)
  {
    try {
      if (!$this->model->find($id)) {
        $this->createLog("DELETE_TRANSACTION", ['ERROR: Transaksi tidak ditemukan.']);
        return $this->failNotFound('Transaksi tidak ditemukan.');
      }

      if (!$this->model->delete($id)) {
        $this->createLog('DELETE_TRANSACTION', ['ERROR']);
        return Services::response()
          ->setJSON([
            'status'  => 'error',
            'message' => 'Gagal menghapus transaksi.'
          ])
          ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
      }
      $this->createLog('DELETE_TRANSACTION', ['SUCCESS']);
      return Services::response()
        ->setJSON([
          'status'  => 'success',
          'message' => 'Transaksi berhasil dihapus.'
        ])
        ->setStatusCode(ResponseInterface::HTTP_OK);
    } catch (Exception $e) {
      $this->createLog('DELETE_TRANSACTION', ['ERROR']);
      return Services::response()
        ->setJSON([
          'status'  => 'error',
          'message' => 'Terjadi kesalahan pada server.',
          'error'   => $e->getMessage()
        ])
        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }
  }
}
