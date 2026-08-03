import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { createProductService } from "../services/sellerProduct.service.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";









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