import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { createSellerService } from "./seller.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Types } from "mongoose";


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