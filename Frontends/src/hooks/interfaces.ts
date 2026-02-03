// src/api/interfaces.ts

export interface Transaction {
  transaction_code: string;
  date: string;
  total_transactions: string;
  total_sales: string;
}

export interface TransactionsReport {
  [branchName: string]: Transaction[] | [];
}

export interface ProductSellsReport {
  product_id: string;
  product_name: string;
  total_sold: string;
  total_sales: string;
}

export interface BranchReport {
  branch_id: string;
  branch_name: string;
  total_transactions: string;
  total_sales: string;
}

export interface AllReportsResponse {
  transactions_report: TransactionsReport;
  product_sells_report: ProductSellsReport[];
  branch_report: BranchReport[];
}

// ================================= Interface getDetailReport (day)
export interface AllDetailReportsResponse {
  transactions_report: DetailTransactionsReport;
  product_sells_report: ProductSellsReport[];
  branch_report: BranchReport[];
}
export interface DetailTransactionsReport {
  [branchName: string]: DetailTransaction[] | [];
}

export interface DetailTransaction {
  date: string;
  transaction_code: string;
  total_item: string;
  payment_method: string;
  is_online_order: string;
  total_price: string;
  total_transactions: string;
  total_sales: string;
}
