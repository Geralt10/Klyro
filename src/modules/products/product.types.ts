import { ProductSize } from "./product.enums.js";

export interface ProductImage {
  url: string;
  fileId: string;
}

export interface ProductInventory {
  size: ProductSize;
  stock: number;
}

