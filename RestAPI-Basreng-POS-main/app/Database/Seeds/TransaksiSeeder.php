<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class TransaksiSeeder extends Seeder
{
  public function run()
  {
    $db = \Config\Database::connect();

    // =========================
    // RESET TABLE
    // =========================
    $db->query('SET FOREIGN_KEY_CHECKS=0');
    $db->table('transaction_details')->truncate();
    $db->table('transactions')->truncate();
    $db->query('SET FOREIGN_KEY_CHECKS=1');

    $products = $db->table('products')->get()->getResultArray();
    $variants = $db->table('product_variants')->get()->getResultArray();

    // =========================
    // USER PER BRANCH
    // =========================
    $userByBranch = [
      1 => [1, 5],
      2 => [4, 3],
      3 => [6],
    ];

    $branches = [1, 2, 3];

    // =========================
    // VARIANT MAP
    // =========================
    $variantMap = [];
    foreach ($variants as $v) {
      $variantMap[$v['product_id']][] = $v;
    }

    // =========================
    // KATEGORI
    // =========================
    $kategori = [
      1 => [],
      2 => [],
      3 => [],
      4 => [],
      5 => [],
    ];

    foreach ($products as $p) {
      if (isset($kategori[$p['category_id']])) {
        $kategori[$p['category_id']][] = $p;
      }
    }

    $start = strtotime('-3 months');
    $end   = time();

    $dayIndex = 0;

    // =========================
    // 🆕 SHOPEE SCHEDULE (1-3x per bulan)
    // =========================
    $shopeeSchedule = [];
    $current = $start;

    while ($current <= $end) {
      $monthKey = date('Y-m', $current);

      if (!isset($shopeeSchedule[$monthKey])) {
        $count = rand(1, 3);
        $days = [];

        while (count($days) < $count) {
          $randomDay = rand(1, date('t', $current));
          $days[] = $randomDay;
          $days = array_unique($days);
        }

        $shopeeSchedule[$monthKey] = $days;
      }

      $current = strtotime('+1 month', $current);
    }

    while ($start <= $end) {

      $date = date('Y-m-d', $start);
      $monthKey = date('Y-m', $start);
      $dayOfMonth = date('j', $start);

      // =========================
      // 🆕 LIMIT SUSHI PER HARI
      // =========================
      $sushiDailyLimit = 100;
      $sushiSoldToday = 0;

      $isWeekend = date('N', $start) >= 6;
      $totalTransaksi = $isWeekend ? rand(20, 65) : rand(30, 45);

      if ($dayIndex % 7 === 0) {
        $paketDay = rand(0, 6);
      }

      for ($i = 0; $i < $totalTransaksi; $i++) {

        $details = [];

        // =========================
        // BRANCH & USER
        // =========================
        $branchId = $branches[array_rand($branches)];
        $userId = $userByBranch[$branchId][array_rand($userByBranch[$branchId])];

        $totalPrice = 0;

        // =========================
        // 🆕 CEK SHOPEE
        // =========================
        $isShopee = in_array($dayOfMonth, $shopeeSchedule[$monthKey]) && $i === 0;

        $isPaket = ($dayIndex % 7 === $paketDay && $i === 0 && !$isShopee);

        $hour = $this->generateRealisticHour();
        $minute = rand(0, 59);

        // =========================
        // SHOPEE = BEHAVIOR PAKET
        // =========================
        if ($isShopee && !empty($kategori[4])) {

          $product = $kategori[4][array_rand($kategori[4])];
          if (empty($variantMap[$product['id']])) continue;

          $variant = $variantMap[$product['id']][0];

          $details[] = [
            'variant_id' => $variant['id'],
            'quantity'   => 1
          ];

          $totalPrice += $variant['price'];
        }

        // =========================
        // PAKET NORMAL
        // =========================
        elseif ($isPaket && !empty($kategori[4])) {

          $product = $kategori[4][array_rand($kategori[4])];
          if (empty($variantMap[$product['id']])) continue;

          $variant = $variantMap[$product['id']][0];

          $details[] = [
            'variant_id' => $variant['id'],
            'quantity'   => 1
          ];

          $totalPrice += $variant['price'];
        }

        // =========================
        // TRANSAKSI NORMAL
        // =========================
        else {

          $totalItem = rand(2, 8);

          for ($j = 0; $j < $totalItem; $j++) {

            $jenis = $this->weightedCategory();
            if (empty($kategori[$jenis])) continue;

            $product = $kategori[$jenis][array_rand($kategori[$jenis])];
            if (empty($variantMap[$product['id']])) continue;

            $variant = $variantMap[$product['id']][array_rand($variantMap[$product['id']])];

            // =========================
            // 🆕 KHUSUS SUSHI LIMIT
            // =========================
            if ($product['id'] == 48) {

              if ($sushiSoldToday >= $sushiDailyLimit) {
                continue; // skip sushi kalau sudah limit
              }

              $remaining = $sushiDailyLimit - $sushiSoldToday;

              $qty = rand(4, 12);
              if ($qty > $remaining) {
                $qty = $remaining;
              }

              $sushiSoldToday += $qty;
            } else {

              switch ($jenis) {
                case 1:
                  $qty = rand(1, 3);
                  break;
                case 2:
                  $qty = rand(1, 2);
                  break;
                case 3:
                  $qty = rand(4, 12);
                  break;
                case 5:
                  $qty = rand(1, 2);
                  break;
                default:
                  $qty = 1;
              }
            }

            $details[] = [
              'variant_id' => $variant['id'],
              'quantity'   => $qty
            ];

            $totalPrice += $variant['price'] * $qty;
          }
        }

        if (empty($details)) continue;

        // =========================
        // 🆕 PAYMENT METHOD (3 TIPE)
        // =========================
        if ($isShopee) {
          $transactionType = 'shopee';
          $paymentMethod = 'transfer_bank';
        } else {

          $randPay = rand(1, 100);

          if ($randPay <= 60) {
            $paymentMethod = 'cash';
          } elseif ($randPay <= 85) {
            $paymentMethod = 'qris';
          } else {
            $paymentMethod = 'transfer_bank';
          }

          $transactionType = 'POS';
        }

        if ($paymentMethod === 'cash') {
          $cashAmount = $this->generateCash($totalPrice);
          $change = $cashAmount - $totalPrice;
        } else {
          $cashAmount = $totalPrice;
          $change = 0;
        }

        $transactionData = [
          'transaction' => [
            'transaction_code' => 'TRX-' . uniqid(),
            'user_id'          => $userId,
            'branch_id'        => $branchId,
            'date_time'        => "$date $hour:$minute:00",
            'total_price'      => $totalPrice,
            'cash_amount'      => $cashAmount,
            'change_amount'    => $change,
            'payment_method'   => $paymentMethod,
            'is_online_order'  => $isShopee ? 1 : (rand(1, 100) <= 20 ? 1 : 0),
            'transaction_type' => $transactionType,
            'is_reseller'      => 0
          ],
          'transaction_details' => $details
        ];

        $this->insertTransaction($transactionData);
      }

      $start = strtotime('+1 day', $start);
      $dayIndex++;
    }
  }

  // =========================
  // (TIDAK BERUBAH)
  // =========================
  private function insertTransaction($data)
  {
    $db = \Config\Database::connect();

    $transactionModel = new \App\Models\TransactionModel();
    $transactionDetailsModel = new \App\Models\TransactionDetailsModel();

    $db->transBegin();

    try {

      $transactionModel->insert($data['transaction']);
      $trxId = $transactionModel->getInsertID();

      foreach ($data['transaction_details'] as $item) {

        $variant = $db->table('product_variants')
          ->where('id', $item['variant_id'])
          ->get()
          ->getRowArray();

        if (!$variant) throw new \Exception("Variant tidak ditemukan");

        $transactionDetailsModel->insert([
          'transaction_id'      => $trxId,
          'product_variant_id' => $variant['id'],
          'quantity'           => $item['quantity'],
          'price'              => $variant['price'],
          'subtotal'           => $variant['price'] * $item['quantity'],
        ]);
      }

      if ($db->transStatus() === false) {
        $db->transRollback();
        return;
      }

      $db->transCommit();
    } catch (\Throwable $e) {
      $db->transRollback();
    }
  }

  private function generateRealisticHour()
  {
    $rand = rand(1, 100);

    if ($rand <= 10) return rand(8, 10);
    if ($rand <= 40) return rand(11, 14);
    if ($rand <= 80) return rand(15, 18);
    return rand(19, 22);
  }

  private function weightedCategory()
  {
    $pool = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 5, 5];
    return $pool[array_rand($pool)];
  }

  private function generateCash($total)
  {
    $options = [
      ceil($total / 1000) * 1000,
      ceil($total / 5000) * 5000,
      ceil($total / 10000) * 10000,
      ceil($total / 20000) * 20000,
    ];

    return $options[array_rand($options)];
  }
}
