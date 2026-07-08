import { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError.js";
import { UserRole } from "../constants/user.js";

export const authorize =
  (...roles: UserRole[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You are not authorized to perform this action."
      );
    }

    next();
  };