import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

import { ApiError } from "../utils/ApiError.js";

export const validateQuery =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new ApiError(400, result.error.issues[0].message);
    }

    req.validatedQuery = result.data;

    next();
  };