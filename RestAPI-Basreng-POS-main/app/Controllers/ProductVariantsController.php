<?php

namespace App\Controllers;

use App\Models\ProductVariantModel;
use CodeIgniter\RESTful\ResourceController;

class ProductVariantsController extends ResourceController
{
  protected $modelName = ProductVariantModel::class;
  protected $format = 'json';

  public function index()
  {
    $db = \Config\Database::connect();

    $builder = $db->table('products p');

    $builder->select("
        p.id as product_id,
        p.name,
        p.img,
        p.category_id,

        pv.id as variant_id,
        pv.weight_grams,
        pv.price
    ");

    $builder->join(
      'product_variants pv',
      'pv.product_id = p.id',
      'left'
    );

    $builder->orderBy('p.id', 'ASC');

    $result = $builder->get()->getResultArray();

    // ===============================
    // GROUPING PRODUCTS -> VARIANTS
    // ===============================

    $products = [];

    foreach ($result as $row) {

      $pid = $row['product_id'];

      if (!isset($products[$pid])) {
        $products[$pid] = [
          'id' => $pid,
          'name' => $row['name'],
          'img' => $row['img'],
          'category_id' => $row['category_id'],
          'variants' => []
        ];
      }

      // jika ada variant
      if ($row['variant_id']) {
        $products[$pid]['variants'][] = [
          'variant_id' => $row['variant_id'],
          'weight_grams' => $row['weight_grams'],
          'price' => $row['price'],
        ];
      }
    }

    return $this->respond([
      'status' => 'success',
      'data' => array_values($products)
    ]);
  }

  public function create()
  {
    $data = $this->request->getJSON(true);

    if (!$data) {
      return $this->fail('Invalid JSON', 400);
    }

    $insertData = [
      'product_id'   => $data['product_id'] ?? null,
      'weight_grams' => $data['weight_grams'] ?? null,
      'price'        => $data['price'] ?? null,
    ];

    if (!$this->model->insert($insertData)) {
      return $this->failValidationErrors($this->model->errors());
    }

    return $this->respondCreated([
      'status' => 'success',
      'data'   => $insertData
    ]);
  }

  public function byProduct($productId)
  {
    $variants = $this->model
      ->where('product_id', $productId)
      ->findAll();

    return $this->respond($variants);
  }

  // GET /product-variant/{id}
  public function show($id = null)
  {
    $data = $this->model->find($id);
    if (!$data) {
      return $this->failNotFound('Detail Product Variant tidak ditemukan');
    }
    return $this->respond($data);
  }
}
