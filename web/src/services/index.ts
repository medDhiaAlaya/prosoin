export { default as api } from './api';
export { default as productService } from './product-service';
export { default as categoryService } from './category-service';
export { default as saleService } from './sale-service';
export { default as purchaseService } from './purchase-service';

export type { IProduct, ICreateProduct } from './product-service';
export type { ICategory, ICreateCategory } from './category-service';
export type { ISale, ICreateSale, ISaleItem, ISalesReport } from './sale-service';
export type { IPurchase, ICreatePurchase, IPurchaseItem, IPurchaseReport } from './purchase-service';
