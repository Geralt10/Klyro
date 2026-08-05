import { z } from "zod";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";
import { PaymentMethod } from "./payment.enums.js";

export const checkoutSchema = z
  .object({
    addressId: objectIdSchema,

    paymentMethod: z.enum(PaymentMethod),
  })
  .strict();

export const verifyPaymentSchema = z
  .object({
    paymentId: objectIdSchema,

    razorpayOrderId: z.string().trim().min(1),

    razorpayPaymentId: z.string().trim().min(1),

    razorpaySignature: z.string().trim().min(1),
  })
  .strict();

export const paymentIdParamsSchema = z
  .object({
    paymentId: objectIdSchema,
  })
  .strict();

export const getPaymentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type VerifyPaymentInput = z.infer<
  typeof verifyPaymentSchema
>;

export type PaymentIdParams = z.infer<
  typeof paymentIdParamsSchema
>;

export type GetPaymentsQuery = z.infer<
  typeof getPaymentsQuerySchema
>;
