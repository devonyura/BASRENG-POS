<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use Exception;
use App\Helpers\JwtHelper;

class ReportController extends ResourceController
{

  public function getTransactionsReport($day = 7)
  {
    $db = \Config\Database::connect();

    // FIX: pakai DATE() biar gak tergantung jam
    $query = $db->query("
      SELECT 
        DATE(date_time) AS date, 
        COALESCE(SUM(total_price),0) AS total_sales
      FROM transactions
      WHERE DATE(date_time) >= DATE_SUB(CURDATE(), INTERVAL {$day} DAY)
      GROUP BY DATE(date_time)
      ORDER BY DATE(date_time)
    ");

    return $this->respond($query->getResult());
  }

  public function getProductSellsReport($day = null)
  {
    $db = \Config\Database::connect();

    // ==============================
    // ✅ FIX 1: Handle default day
    // ==============================
    // Jika tidak ada parameter → hanya hari ini
    if (!is_numeric($day)) {
      $day = 0;
    }

    // ==============================
    // ✅ FIX 2: Handle limit (opsional)
    // ==============================
    // contoh: /api/report/product-sells/7?limit=10
    $limit = $this->request->getGet('limit');
    $limitSql = "";

    if (is_numeric($limit) && $limit > 0) {
      $limitSql = "LIMIT {$limit}";
    }

    // ==============================
    // ✅ FIX 3: Query per VARIANT
    // ==============================
    //     -- ==============================
    // -- ✅ FIX 4: Filter tanggal fleksibel
    // -- ==============================
    // -- ==============================
    // -- ✅ FIX 5: GROUP BY VARIANT (bukan product)
    // -- ==============================

    $query = $db->query("
    SELECT 
      pv.id AS variant_id,
      p.name AS product_name,

      -- tampilkan label variant (contoh: Basreng 250gr)
      CASE 
        WHEN pv.weight_grams > 0 
        THEN CONCAT(p.name, ' ', pv.weight_grams, 'gr')
        ELSE p.name
      END AS variant_name,

      SUM(td.quantity) AS total_sold,
      COALESCE(SUM(td.subtotal),0) AS total_sales

    FROM transactions t
    JOIN transaction_details td ON t.id = td.transaction_id
    JOIN product_variants pv ON td.product_variant_id = pv.id
    JOIN products p ON pv.product_id = p.id


    WHERE DATE(t.date_time) >= DATE_SUB(CURDATE(), INTERVAL {$day} DAY)

    GROUP BY pv.id, p.name, pv.weight_grams

    ORDER BY total_sold DESC

    {$limitSql}
  ");

    return $this->respond([
      'status' => 'success',
      'data'   => $query->getResult()
    ]);
  }

  public function getBranchReport($day = 1)
  {
    $db = \Config\Database::connect();

    // FIX: support day dinamis + DATE()
    $query = $db->query("
      SELECT
        b.branch_id,
        b.branch_name,
        COUNT(t.id) AS total_transactions,
        COALESCE(SUM(t.total_price),0) AS total_income
      FROM transactions t
      JOIN branch b ON t.branch_id = b.branch_id
      WHERE DATE(t.date_time) >= DATE_SUB(CURDATE(), INTERVAL {$day} DAY)
      GROUP BY b.branch_id, b.branch_name
      ORDER BY total_income DESC
    ");

    return $this->respond($query->getResult());
  }

  public function getDetailReport($date)
  {
    if (!$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
      return $this->failValidationErrors('Tanggal tidak valid. Gunakan format YYYY-MM-DD.');
    }

    $db = \Config\Database::connect();

    /**
     * Details Report
     */
    $detailsQuery = $db->query("
      SELECT 
        b.branch_id,
        b.branch_name,
        t.transaction_code,
        DATE(t.date_time) AS date,
        SUM(td.quantity) AS total_item,
        t.payment_method,
        t.is_online_order,
        t.total_price
      FROM transactions t
      JOIN transaction_details td ON t.id = td.transaction_id
      JOIN branch b ON t.branch_id = b.branch_id
      WHERE DATE(t.date_time) = ?
      GROUP BY 
        b.branch_id, 
        b.branch_name, 
        t.id
      ORDER BY b.branch_id, t.transaction_code
    ", [$date]);

    $results = $detailsQuery->getResult();

    $detailsFormatted = [];
    foreach ($results as $row) {
      $branchName = $row->branch_name;
      $detailsFormatted[$branchName][] = [
        'date'             => $row->date,
        'transaction_code' => $row->transaction_code,
        'total_item'       => $row->total_item,
        'payment_method'   => $row->payment_method,
        'is_online_order'  => $row->is_online_order,
        'total_price'      => $row->total_price
      ];
    }

    /**
     * Product Sells Report
     */
    $productSellsQuery = $db->query("
      SELECT 
        p.id AS product_id, 
        p.name AS product_name, 
        SUM(td.quantity) AS total_sold,
        COALESCE(SUM(td.subtotal),0) AS total_sales
      FROM transactions t
      JOIN transaction_details td ON t.id = td.transaction_id
      JOIN product_variants pv ON td.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE DATE(t.date_time) = ?
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
    ", [$date]);

    /**
     * Branch Report
     */
    $branchQuery = $db->query("
      SELECT 
        b.branch_id, 
        b.branch_name, 
        COUNT(t.id) AS total_transactions, 
        COALESCE(SUM(t.total_price),0) AS total_sales
      FROM transactions t
      JOIN branch b ON t.branch_id = b.branch_id
      WHERE DATE(t.date_time) = ?
      GROUP BY b.branch_id, b.branch_name
      ORDER BY total_sales DESC
    ", [$date]);

    return $this->respond([
      'transactions_report' => $detailsFormatted,
      'product_sells_report' => $productSellsQuery->getResult(),
      'branch_report' => $branchQuery->getResult()
    ]);
  }

  public function getAllReports()
  {
    $day = $this->request->getGet('day');
    $month = $this->request->getGet('month');
    $year = $this->request->getGet('year');

    if (!is_numeric($day) || $day <= 0) {
      $day = 7;
    }

    if (!is_numeric($year) || $year < 1970) {
      $year = date('Y');
    }

    // FIX: pakai DATE()
    if (is_numeric($month) && $month >= 1 && $month <= 12) {
      $monthCondition = "MONTH(t.date_time) = {$month} AND YEAR(t.date_time) = {$year}";
    } else {
      $monthCondition = "DATE(t.date_time) >= DATE_SUB(CURDATE(), INTERVAL {$day} DAY)";
    }

    $db = \Config\Database::connect();

    /**
     * Transactions Report
     */
    $transactionsQuery = $db->query("
      SELECT 
        b.branch_id,
        b.branch_name,
        DATE(t.date_time) AS date,
        COUNT(t.id) AS total_transactions,
        COALESCE(SUM(t.total_price),0) AS total_sales
      FROM transactions t
      JOIN branch b ON t.branch_id = b.branch_id
      WHERE {$monthCondition}
      GROUP BY b.branch_id, b.branch_name, DATE(t.date_time)
      ORDER BY DATE(t.date_time)
    ");

    $transactions = $transactionsQuery->getResult();

    $transactionsFormatted = [];
    foreach ($transactions as $row) {
      $branchName = $row->branch_name;
      $transactionsFormatted[$branchName][] = [
        'date' => format_tanggal_lokal($row->date),
        'total_transactions' => $row->total_transactions,
        'total_sales' => $row->total_sales
      ];
    }

    /**
     * Product Sells
     */
    $productSellsQuery = $db->query("
      SELECT 
        p.id AS product_id, 
        p.name AS product_name, 
        SUM(td.quantity) AS total_sold,
        COALESCE(SUM(td.subtotal),0) AS total_sales
      FROM transactions t
      JOIN transaction_details td ON t.id = td.transaction_id
      JOIN product_variants pv ON td.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE {$monthCondition}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
    ");

    /**
     * Branch Report
     */
    $branchQuery = $db->query("
      SELECT 
        b.branch_id, 
        b.branch_name, 
        COUNT(t.id) AS total_transactions, 
        COALESCE(SUM(t.total_price),0) AS total_sales
      FROM transactions t
      JOIN branch b ON t.branch_id = b.branch_id
      WHERE {$monthCondition}
      GROUP BY b.branch_id, b.branch_name
      ORDER BY total_sales DESC
    ");

    return $this->respond([
      'transactions_report' => $transactionsFormatted,
      'product_sells_report' => $productSellsQuery->getResult(),
      'branch_report' => $branchQuery->getResult()
    ]);
  }

  private function generateSummary($user, $filterByBranch = false)
  {
    $db = \Config\Database::connect();

    $today = date('Y-m-d');
    $monday = date('Y-m-d', strtotime('monday this week'));
    $monthStart = date('Y-m-01');

    $createBuilder = function () use ($db, $user, $filterByBranch) {
      $builder = $db->table('transactions t');

      // FIX: hanya filter jika kasir
      if ($filterByBranch) {
        $builder->where('t.branch_id', $user['branch_id']);
      }

      return $builder;
    };

    // FIX: pakai COALESCE manual
    $todaySales = $createBuilder()
      ->selectSum('t.total_price')
      ->where('DATE(t.date_time)', $today)
      ->get()->getRow()->total_price ?? 0;

    $todayCount = $createBuilder()
      ->selectCount('t.id')
      ->where('DATE(t.date_time)', $today)
      ->get()->getRow()->id ?? 0;

    $weekSales = $createBuilder()
      ->selectSum('t.total_price')
      ->where("DATE(t.date_time) BETWEEN '$monday' AND '$today'")
      ->get()->getRow()->total_price ?? 0;

    $monthSales = $createBuilder()
      ->selectSum('t.total_price')
      ->where("DATE(t.date_time) BETWEEN '$monthStart' AND '$today'")
      ->get()->getRow()->total_price ?? 0;

    return [
      'hari_ini' => (int)$todaySales,
      'minggu_ini' => (int)$weekSales,
      'bulan_ini' => (int)$monthSales,
      'jumlah_transaksi_hari_ini' => (int)$todayCount,
    ];
  }

  public function summary()
  {
    try {
      $authUser = JwtHelper::getUserFromRequest($this->request);

      if (!$authUser) {
        return $this->failUnauthorized('Unauthorized');
      }

      // FIX: hanya kasir yang difilter
      $filterByBranch = ($authUser['role'] === 'kasir');

      $data = $this->generateSummary($authUser, $filterByBranch);

      return $this->respond([
        'status' => 'success',
        'user' => [
          'id' => $authUser['id'],
          'username' => $authUser['username'],
          'role' => $authUser['role'],
        ],
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return $this->failServerError($e->getMessage());
    }
  }

  public function topSelling($day = null)
  {
    $db = \Config\Database::connect();

    // =========================
    // FIX 1: default hari = hari ini
    // =========================
    if (!is_numeric($day) || $day < 0) {
      $day = 0;
    }

    $dateFrom = date('Y-m-d', strtotime("-$day days"));

    // =========================
    // FIX 2: param limit (optional)
    // contoh: ?limit=5
    // =========================
    $limit = $this->request->getGet('limit');
    if (!is_numeric($limit) || $limit <= 0) {
      $limit = null; // null = semua data
    }

    // =========================
    // FIX 3: query PER VARIANT (bukan product)
    // =========================
    $builder = $db->table('transaction_details td')
      ->select("
      pv.id AS variant_id,
      p.name AS product_name,
      pv.weight_grams,
      pv.price,
      SUM(td.quantity) as total_sold,
      COALESCE(SUM(td.subtotal),0) as total_sales
    ")
      ->join('product_variants pv', 'pv.id = td.product_variant_id')
      ->join('products p', 'p.id = pv.product_id')
      ->join('transactions t', 't.id = td.transaction_id')
      ->where("DATE(t.date_time) >=", $dateFrom)
      ->groupBy('pv.id, p.name, pv.weight_grams, pv.price')
      ->orderBy('total_sold', 'DESC');

    // =========================
    // FIX 4: apply limit jika ada
    // =========================
    if ($limit !== null) {
      $builder->limit($limit);
    }

    $query = $builder->get();

    return $this->respond([
      'status' => 'success',
      'meta' => [
        'day_range' => $day,
        'limit' => $limit ?? 'all'
      ],
      'data' => $query->getResult()
    ]);
  }
}
