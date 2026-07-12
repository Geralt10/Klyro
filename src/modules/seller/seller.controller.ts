import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { createSellerService, getSellerProfileService, updateSellerBannerService, updateSellerLogoService, updateSellerProfileService } from "./seller.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";

//createSeller
export const createSellerController = asyncHandler(async (req:Request, res:Response) => {
    const userId = new Types.ObjectId(req.user.id);
    
    const seller = await createSellerService(
        userId,
        req.body
    );

    return res.status(201).json(
    new ApiResponse(
        201,
        "Seller profile created successfully.",
        seller,
    )
);
});

//getSeller
export const getSellerProfileController = asyncHandler(
  async (req, res) => {
    const userId = new Types.ObjectId(req.user.id);

    const seller = await getSellerProfileService(userId);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller profile fetched successfully.",
        seller,
      )
    );
  }
);


//updateSeller
export const updateSellerProfileController = asyncHandler(
  async (req, res) => {
    const userId = new Types.ObjectId(req.user.id);

    const seller = await updateSellerProfileService(
      userId,
      req.body
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller profile updated successfully.",
        seller,
      )
    );
  }
);

//updateLogo
export const updateSellerLogoController = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "Logo image is required.");
    }

    const { buffer, originalname } = req.file;

    const userId = new Types.ObjectId(req.user.id);

    const seller = await updateSellerLogoService(
      userId,
      buffer,
      originalname
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller logo updated successfully.",
        seller,
      )
    );
  }
);

//updateBanner
export const updateSellerBannerController = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "Banner image is required.");
    }

    const userId = new Types.ObjectId(req.user.id);

    const { buffer, originalname } = req.file;

    const seller = await updateSellerBannerService(
      userId,
      buffer,
      originalname
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller banner updated successfully.",
        seller,
      )
    );
  }
);