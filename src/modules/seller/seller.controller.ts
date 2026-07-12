import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { createSellerService, getSellerProfileService, updateSellerProfileService } from "./seller.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Types } from "mongoose";

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
