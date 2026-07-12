import { Router } from "express";

import { createSellerController } from "./seller.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";

import { createSellerSchema } from "./seller.validation.js";

const sellerRouter = Router();

sellerRouter.post(
  "/create",
  authenticate,
  validate(createSellerSchema),
  createSellerController
);

export default sellerRouter;