import { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

export const authenticate = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new ApiError(401, "Access token is required.");
    }

    const payload = verifyAccessToken(accessToken);

    req.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  }
);