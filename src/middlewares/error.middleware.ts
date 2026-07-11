import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
 if (error instanceof ApiError) {
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
}

logger.error(
  { err: error },
  "Unhandled server error."
);

return res.status(500).json({
  success: false,
  message: "Internal Server Error",
});
};