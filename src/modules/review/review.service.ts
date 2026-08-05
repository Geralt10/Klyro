import { Types } from "mongoose";
import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { orderModel } from "../order/order.model.js";
import { OrderStatus } from "../order/order.enums.js";
import { productModel } from "../products/product.model.js";
import {
  CreateReviewInput,
  PaginationQuery,
  UpdateReviewInput,
} from "./review.validation.js";
import { reviewModel } from "./review.model.js";
import type { IReview } from "./review.model.js";

const recalculateProductRating = async (
  productId: string,
  session?: mongoose.ClientSession
) => {
  const agg = reviewModel.aggregate([
    {
      $match: {
        product: new Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: {
          $avg: "$rating",
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  if (session) {
    agg.session(session);
  }

  const [result] = await agg;

  await productModel.findByIdAndUpdate(
    productId,
    {
      $set: {
        averageRating: result?.averageRating ?? 0,
        totalReviews: result?.totalReviews ?? 0,
      },
    },
    { session }
  );
};

export const createReviewService = async (
  userId: string,
  data: CreateReviewInput
) => {
  const order = await orderModel
    .findOne({
      _id: data.orderId,
      user: userId,
    })
    .select("orderItems orderStatus")
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.orderStatus !== OrderStatus.DELIVERED) {
    throw new ApiError(400, "Order has not been delivered.");
  }

  const orderItem = order.orderItems.find((item) =>
    item.productId.equals(data.productId)
  );

  if (!orderItem) {
    throw new ApiError(400, "Product does not belong to this order.");
  }

  const session: mongoose.ClientSession = await mongoose.startSession();
  let review: HydratedDocument<IReview> | undefined;

  try {
    await session.withTransaction(async () => {
      const existingReview = await reviewModel
        .exists({
          user: userId,
          product: data.productId,
        })
        .session(session);

      if (existingReview) {
        throw new ApiError(409, "Review already exists for this product.");
      }

      const [created] = await reviewModel.create([
        {
          user: userId,
          product: data.productId,
          order: data.orderId,
          rating: data.rating,
          comment: data.comment,
        },
      ], { session });

      await recalculateProductRating(data.productId, session);

      review = created;
    });

    return review;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError(409, "Review already exists for this product.");
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const updateReviewService = async (
  userId: string,
  reviewId: string,
  data: UpdateReviewInput
) => {
  const session: mongoose.ClientSession = await mongoose.startSession();
  let updatedReview: HydratedDocument<IReview> | undefined;

  try {
    await session.withTransaction(async () => {
      const review = await reviewModel
        .findOne({
          _id: reviewId,
          user: userId,
        })
        .session(session);

      if (!review) {
        throw new ApiError(404, "Review not found.");
      }

      Object.assign(review, data);

      await review.save({ session });

      await recalculateProductRating(review.product.toString(), session);

      updatedReview = review;
    });

    return updatedReview;
  } finally {
    await session.endSession();
  }
};

export const deleteReviewService = async (
  userId: string,
  reviewId: string
) => {
  const session: mongoose.ClientSession = await mongoose.startSession();
  let deletedReview: HydratedDocument<IReview> | undefined;

  try {
    await session.withTransaction(async () => {
      const review = await reviewModel
        .findOne({
          _id: reviewId,
          user: userId,
        })
        .session(session);

      if (!review) {
        throw new ApiError(404, "Review not found.");
      }

      const productId = review.product.toString();

      await review.deleteOne({ session });

      await recalculateProductRating(productId, session);

      deletedReview = review;
    });

    return deletedReview;
  } finally {
    await session.endSession();
  }
};

export const getMyReviewsService = async (
  userId: string,
  query: PaginationQuery
) => {
  const skip = (query.page - 1) * query.limit;

  const [totalReviews, reviews] = await Promise.all([
    reviewModel.countDocuments({
      user: userId,
    }),

    reviewModel
      .find({
        user: userId,
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    reviews,

    pagination: {
      page: query.page,
      limit: query.limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / query.limit),
    },
  };
};

export const getProductReviewsService = async (
  productId: string,
  query: PaginationQuery
) => {
  const product = await productModel.exists({
    _id: productId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const skip = (query.page - 1) * query.limit;

  const [totalReviews, reviews] = await Promise.all([
    reviewModel.countDocuments({
      product: productId,
    }),

    reviewModel
      .find({
        product: productId,
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(query.limit)
      .populate({ path: "user", select: "name avatar" })
      .lean(),
  ]);

  return {
    reviews,

    pagination: {
      page: query.page,
      limit: query.limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / query.limit),
    },
  };
};
