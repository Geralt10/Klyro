import z from "zod";
import { ProductCategory, ProductSort, ProductStatus } from "./product.enums.js";



export const getSellerProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    search: z.string().trim().optional(),

    status: z.nativeEnum(ProductStatus).optional(),

    category: z.nativeEnum(ProductCategory).optional(),

    sort: z.nativeEnum(ProductSort).default(ProductSort.NEWEST),
  })
  .strict();

export type GetSellerProductsQuery = z.infer<
  typeof getSellerProductsQuerySchema
>;