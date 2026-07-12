import { Router } from "express";

import { createSellerController, getSellerProfileController, updateSellerProfileController } from "./seller.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";

import { createSellerSchema, updateSellerSchema } from "./seller.validation.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../constants/user.js";

const sellerRouter = Router();

sellerRouter.post("/",authenticate,validate(createSellerSchema),createSellerController);

sellerRouter.get("/",authenticate,authorize(UserRole.SELLER),getSellerProfileController);

sellerRouter.patch("/",authenticate,authorize(UserRole.SELLER),validate(updateSellerSchema),updateSellerProfileController);

export default sellerRouter;