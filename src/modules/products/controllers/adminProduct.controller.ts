import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { GetAdminProductsQuery } from "../getProductsQuerySchema.js";
import { ProductIdParams } from "../product.validation.js";
import {
  getAdminProductByIdService,
  getAdminProductsService,
} from "../services/adminProduct.service.js";

export const getAdminProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAdminProductsService(
      req.validatedQuery as GetAdminProductsQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Products fetched successfully.",
        result
      )
    );
  }
);

export const getAdminProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } =
      req.validatedParams as ProductIdParams;

    const product = await getAdminProductByIdService(
      productId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product fetched successfully.",
        product
      )
    );
  }
);