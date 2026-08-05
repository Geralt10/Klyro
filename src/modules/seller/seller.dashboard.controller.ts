import { Request, Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getSellerDashboardService } from "./seller.dashboard.service.js";

export const getSellerDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await getSellerDashboardService(req.user.id);

    return res.status(200).json(
      new ApiResponse(200, "Seller dashboard fetched successfully.", dashboard)
    );
  }
);
