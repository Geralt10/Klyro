import { Document, Types } from "mongoose";

import {
  ProductCategory,
  ProductFit,
  ProductGender,
  ProductStatus,
} from "./product.enums.js";

import { ProductImage, ProductInventory } from "./product.types.js";

export interface IProduct extends Document {
  seller: Types.ObjectId;

  name: string;

  slug: string;

  description: string;

  brand: string;

  gender: ProductGender;

  category: ProductCategory;

  fit: ProductFit;

  color: string;

  basePrice: number;

  discountPercentage: number;

  inventory: ProductInventory[];

  images: ProductImage[];

  status: ProductStatus;

  readonly finalPrice: number;

  createdAt: Date;

  updatedAt: Date;
}