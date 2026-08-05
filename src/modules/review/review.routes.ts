import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import { validateQuery } from "../../middlewares/validateQuery.middleware.js";
import {
  createReviewController,
  deleteReviewController,
  getMyReviewsController,
  getProductReviewsController,
  updateReviewController,
} from "./review.controller.js";
import {
  createReviewSchema,
  paginationQuerySchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
  updateReviewSchema,
} from "./review.validation.js";

const reviewRouter = Router();
export const productReviewRouter = Router();

reviewRouter.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  createReviewController
);

reviewRouter.get(
  "/me",
  authenticate,
  validateQuery(paginationQuerySchema),
  getMyReviewsController
);

reviewRouter.patch(
  "/:reviewId",
  authenticate,
  validateParams(reviewIdParamsSchema),
  validate(updateReviewSchema),
  updateReviewController
);

reviewRouter.delete(
  "/:reviewId",
  authenticate,
  validateParams(reviewIdParamsSchema),
  deleteReviewController
);

productReviewRouter.get(
  "/:productId/reviews",
  authenticate,
  validateParams(productIdParamsSchema),
  validateQuery(paginationQuerySchema),
  getProductReviewsController
);

export default reviewRouter;
