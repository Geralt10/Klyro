import { string, z } from "zod";

import {
  ProductCategory,
  ProductFit,
  ProductGender,
  ProductSize,
  ProductStatus
} from "./product.enums.js";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";


const productInventorySchema = z
  .object({
    size: z.enum(ProductSize),
    stock: z.number().int().min(0),
  })
  .strict();

const productBaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3)
      .max(150),

    description: z
      .string()
      .trim()
      .min(20)
      .max(5000),

    brand: z
      .string()
      .trim()
      .min(2)
      .max(80),

    gender: z.enum(ProductGender),

    category: z.enum(ProductCategory),

    fit: z.enum(ProductFit),

    color: z
      .string()
      .trim()
      .min(2)
      .max(50),
      
    status: z.enum(ProductStatus).optional(),

    basePrice: z.coerce.number().positive(),

    discountPercentage: z.coerce.number().min(0).max(100),

   inventory: z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value;
  },
  z.array(productInventorySchema)
)
  })
  .strict();

const validateUniqueInventorySizes = (
  inventory: z.infer<typeof productInventorySchema>[],
  ctx: z.RefinementCtx
) => {
  const seenSizes = new Set<ProductSize>();

  inventory.forEach(({ size }, index) => {
    if (seenSizes.has(size)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inventory", index, "size"],
        message: `Duplicate size '${size}' is not allowed.`,
      });

      return;
    }

    seenSizes.add(size);
  });
};  


export const createProductSchema = productBaseSchema.superRefine(
  ({ inventory }, ctx) => {
    validateUniqueInventorySizes(inventory, ctx);
  }
);

export const updateProductSchema = productBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (!data.inventory) return;

    validateUniqueInventorySizes(data.inventory, ctx);
  });


export const changeProductStatusSchema = z
  .object({
    status: z.enum(ProductStatus),
  })
  .strict();  
  

export const productIdParamSchema = z
  .object({
    productId: objectIdSchema,
  })
  .strict();  





export type CreateProductInput = z.infer<typeof createProductSchema>;


export const productIdParamsSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export type ProductIdParams = z.infer<
  typeof productIdParamsSchema
>;