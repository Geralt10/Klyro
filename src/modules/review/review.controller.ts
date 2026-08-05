import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
  CreateReviewInput,
  PaginationQuery,
  ProductIdParams,
  ReviewIdParams,
  UpdateReviewInput,
} from "./review.validation.js";
import {
  createReviewService,
  deleteReviewService,
  getMyReviewsService,
  getProductReviewsService,
  updateReviewService,
} from "./review.service.js";

export const createReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await createReviewService(
      req.user.id,
      req.body as CreateReviewInput
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Review created successfully.",
        review
      )
    );
  }
);

export const updateReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { reviewId } = req.validatedParams as ReviewIdParams;

    const review = await updateReviewService(
      req.user.id,
      reviewId,
      req.body as UpdateReviewInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Review updated successfully.",
        review
      )
    );
  }
);

export const deleteReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { reviewId } = req.validatedParams as ReviewIdParams;

    const review = await deleteReviewService(
      req.user.id,
      reviewId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Review deleted successfully.",
        review
      )
    );
  }
);

export const getMyReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getMyReviewsService(
      req.user.id,
      req.validatedQuery as PaginationQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Reviews fetched successfully.",
        result
      )
    );
  }
);

export const getProductReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } =
      req.validatedParams as ProductIdParams;

    const result = await getProductReviewsService(
      productId,
      req.validatedQuery as PaginationQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product reviews fetched successfully.",
        result
      )
    );
  }
);
