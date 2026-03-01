<?php

namespace App\Controllers;

use App\Models\ProductModel;
use App\Models\ActivityLogModel;
use App\Helpers\JwtHelper;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;

class ProductsController extends ResourceController
{
  protected $modelName = 'App\Models\ProductModel';
  protected $format    = 'json';

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

  // GET /products
  public function index()
  {
    try {
      $data = $this->model->findAll();
      if (empty($data)) {
        $this->createLog('READ_ALL_PRODUCTS', 'Tidak ada data produk.');
        return $this->failNotFound('Tidak ada data produk.');
      }
      $this->createLog('READ_ALL_PRODUCTS', ['SUCCESS']);
      return $this->respond([
        'status' => 'success',
        'data'   => $data
      ]);
    } catch (Exception $e) {
      $this->createLog('READ_ALL_PRODUCTS', ['ERROR']);
      return Services::response()
        ->setJSON([
          'status'  => 'error',
          'message' => 'Terjadi kesalahan pada server.',
          'error'   => $e->getMessage()
        ])
        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  // POST /products
  public function create()
  {
    $file = $this->request->getFile('img');

    $imgName = null;

    if ($file && $file->isValid()) {
      $imgName = $file->getRandomName();
      $file->move(FCPATH . 'uploads/products/', $imgName);
    }

    $productData = [
      'category_id'    => $this->request->getPost('category_id'),
      'subcategory_id' => $this->request->getPost('subcategory_id'),
      'name'           => $this->request->getPost('name'),
      'descriptions'   => $this->request->getPost('descriptions'),
      'img'            => $imgName
    ];

    $this->model->insert($productData);

    return $this->respondCreated([
      'status' => 'success',
      'message' => 'Product master created'
    ]);
  }

  // POST api/products/update/{id}
  public function update($id = null)
  {
    // dd($this->request->getFile('img'));
    $product = $this->model->find($id);

    if (!$product) {
      return $this->failNotFound('Produk tidak ditemukan');
    }

    $file = $this->request->getFile('img');

    $imgName = $product['img'];

    // jika upload gambar baru
    if ($file && $file->isValid()) {

      // hapus gambar lama
      if (
        $product['img'] &&
        file_exists(FCPATH . 'uploads/products/' . $product['img'])
      ) {

        unlink(FCPATH . 'uploads/products/' . $product['img']);
      }

      $imgName = $file->getRandomName();

      $file->move(
        FCPATH . 'uploads/products/',
        $imgName
      );
    }

    $data = [
      'name' => $this->request->getPost('name'),
      'category_id' => $this->request->getPost('category_id'),
      'subcategory_id' => $this->request->getPost('subcategory_id'),
      'price' => $this->request->getPost('price'),
      'descriptions' => $this->request->getPost('descriptions'),
      'weight_grams' => $this->request->getPost('weight_grams'),
      'img' => $imgName
    ];

    $this->model->update($id, $data);

    return $this->respond([
      'status' => 'success'
    ]);
  }

  // DELETE /products/{id}
  public function delete($id = null)
  {
    $product = $this->model->find($id);

    if (!$product) {
      return $this->failNotFound();
    }

    if (
      $product['img'] &&
      file_exists(FCPATH . 'uploads/products/' . $product['img'])
    ) {

      unlink(FCPATH . 'uploads/products/' . $product['img']);
    }

    $this->model->delete($id);

    return $this->respondDeleted([
      'status' => 'success'
    ]);
  }
}
