import z from "zod";
import { ProductCategory, ProductGender, ProductSize, ProductSort, ProductStatus } from "./product.enums.js";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";


export const getSellerProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    search: z.string().trim().optional(),

    status: z.enum(ProductStatus).optional(),

    category: z.enum(ProductCategory).optional(),

    sort: z.enum(ProductSort).default(ProductSort.NEWEST),
  })
  .strict();

export const getProductQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    category: z.enum(ProductCategory).optional(),

    status: z.enum(ProductStatus).optional(),

    gender: z.enum(ProductGender).optional(),

    brand: z.string().trim().optional(),

    color: z.string().trim().optional(),

    size: z.enum(ProductSize).optional(),

    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    sort: z
      .enum(ProductSort)
      .default(ProductSort.NEWEST),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minPrice"],
        message:
          "Minimum price cannot be greater than maximum price.",
      });
    }
  }); 

export const getAdminProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    search: z.string().trim().optional(),

    category: z.enum(ProductCategory).optional(),

    status: z.enum(ProductStatus).optional(),

    sellerId: objectIdSchema.optional(),

    sort: z.enum(ProductSort).default(ProductSort.NEWEST),
  })
  .strict();

export type GetAdminProductsQuery = z.infer<
  typeof getAdminProductsQuerySchema
>;

  
export type GetProductsQuery = z.infer<typeof getProductQuerySchema>;  

export type GetSellerProductsQuery = z.infer<
  typeof getSellerProductsQuerySchema
>;

