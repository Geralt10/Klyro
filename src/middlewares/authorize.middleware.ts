import { NextFunction, Request, Response } from "express";

import { UserRole } from "../constants/user.js";
import { ApiError } from "../utils/ApiError.js";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    console.log("User Role:", req.user?.role);
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You are not authorized to access this resource."
      );
    }

    next();
  };