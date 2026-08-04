import { z } from "zod";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";
import { ProductSize } from "../products/product.enums.js";

export const addToCartSchema = z
  .object({
    productId: objectIdSchema,

    size: z.enum(ProductSize),

    quantity: z.coerce.number().int().min(1),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().min(1),
  })
  .strict();

export const cartItemIdParamsSchema = z
  .object({
    cartItemId: objectIdSchema,
  })
  .strict();

export type AddToCartInput = z.infer<
  typeof addToCartSchema
>;

export type UpdateCartItemInput = z.infer<
  typeof updateCartItemSchema
>;

export type CartItemIdParams = z.infer<
  typeof cartItemIdParamsSchema
>;
