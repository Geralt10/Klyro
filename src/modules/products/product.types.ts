import { ProductCategory, ProductGender, ProductSize, ProductSort } from "./product.enums.js";

export interface ProductInventory {
  size: ProductSize;
  stock: number;
}

export type GetBuyerProductsQuery = {
  page: number;
  limit: number;

  search?: string;

  category?: ProductCategory;

  gender?: ProductGender;

  brand?: string;

  color?: string;

  size?: ProductSize;

  minPrice?: number;

  maxPrice?: number;

  sort: ProductSort;
};