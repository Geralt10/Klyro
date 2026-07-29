import { ProductSize } from "./product.enums.js";

export interface ProductInventory {
  size: ProductSize;
  stock: number;
}

