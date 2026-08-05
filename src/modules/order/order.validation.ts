import { z } from "zod";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";
import { OrderStatus } from "./order.enums.js";

export const createOrderSchema = z
  .object({
    paymentId: objectIdSchema,
  })
  .strict();

export const orderIdParamsSchema = z
  .object({
    orderId: z
      .string()
      .trim()
      .regex(
        /^ORD-\d{8}-[A-Z0-9]{6}$/,
        "Invalid order number."
      ),
  })
  .strict();

export const getOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export const sellerOrderParamsSchema = z
  .object({
    orderNumber: z
      .string()
      .trim()
      .regex(
        /^ORD-\d{8}-[A-Z0-9]{6}$/,
        "Invalid order number."
      ),
  })
  .strict();

export const updateSellerOrderStatusSchema = z
  .object({
    status: z.enum(OrderStatus),
  })
  .strict();

export const sellerOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    status: z.enum(OrderStatus).optional(),
  })
  .strict();

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;

export type OrderIdParams = z.infer<
  typeof orderIdParamsSchema
>;

export type GetOrdersQuery = z.infer<
  typeof getOrdersQuerySchema
>;

export type SellerOrderParams = z.infer<
  typeof sellerOrderParamsSchema
>;

export type UpdateSellerOrderStatusInput = z.infer<
  typeof updateSellerOrderStatusSchema
>;

export type SellerOrdersQuery = z.infer<
  typeof sellerOrdersQuerySchema
>;
