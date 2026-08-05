import { z } from "zod";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";

const reviewBaseSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5),

    comment: z.string().trim().min(5).max(1000),
  })
  .strict();

export const createReviewSchema = reviewBaseSchema.extend({
  productId: objectIdSchema,

  orderId: objectIdSchema,
});

export const updateReviewSchema = reviewBaseSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update.",
    }
  );

export const reviewIdParamsSchema = z
  .object({
    reviewId: objectIdSchema,
  })
  .strict();

export const productIdParamsSchema = z
  .object({
    productId: objectIdSchema,
  })
  .strict();

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type CreateReviewInput = z.infer<
  typeof createReviewSchema
>;

export type UpdateReviewInput = z.infer<
  typeof updateReviewSchema
>;

export type ReviewIdParams = z.infer<
  typeof reviewIdParamsSchema
>;

export type ProductIdParams = z.infer<
  typeof productIdParamsSchema
>;

export type PaginationQuery = z.infer<
  typeof paginationQuerySchema
>;
