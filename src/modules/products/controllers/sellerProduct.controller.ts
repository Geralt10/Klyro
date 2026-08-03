import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { changeProductStatusService, createProductService, getSellerProductByIdService, getSellerProductsService, updateProductService } from "../services/sellerProduct.service.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { GetSellerProductsQuery } from "../getSellerProductsQuerySchema.js";
import { Types } from "mongoose";
import { ProductIdParams } from "../product.validation.js";





export const createProductController = asyncHandler(
  async (req:Request, res:Response) => {
    const product = await createProductService(
      req.user.id,
      req.body,
      req.files as Express.Multer.File[]
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Product created successfully.",product));
  }
);


export const getSellerProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getSellerProductsService(
      req.user.id,
      req.validatedQuery as GetSellerProductsQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller products fetched successfully.",
        result
      )
    );
  }
);


export const getSellerProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } =
      req.validatedParams as ProductIdParams;

    const product = await getSellerProductByIdService(
      req.user.id,
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


export const updateProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.validatedParams as ProductIdParams;
    const product = await updateProductService(
      req.user.id,
      productId,
      req.body,
      req.files as Express.Multer.File[]
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product updated successfully.",
        product
      )
    );
  }
);


export const changeProductStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as ProductIdParams;

    const product = await changeProductStatusService(
      req.user.id,
      productId,
      req.body.status
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product status updated successfully.",
        product
      )
    );
  }
);