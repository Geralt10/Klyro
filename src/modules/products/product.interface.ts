import { Types } from "mongoose";

import {
  ProductCategory,
  ProductFit,
  ProductGender,
  ProductStatus,
} from "./product.enums.js";

import { ProductInventory } from "./product.types.js";
import { IImage } from "../../shared/schemas/image.schema.js";

export interface IProduct{
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

  averageRating: number;

  totalReviews: number;

  inventory: ProductInventory[];

  images: IImage[];

  status: ProductStatus;

  readonly finalPrice: number;

  createdAt: Date;

  updatedAt: Date;
}
