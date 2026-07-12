import { Router } from "express";

import { createSellerController, getSellerProfileController } from "./seller.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";

import { createSellerSchema } from "./seller.validation.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../constants/user.js";

const sellerRouter = Router();

sellerRouter.post("/create",authenticate,validate(createSellerSchema),createSellerController);

sellerRouter.get("/",authenticate,authorize(UserRole.SELLER),getSellerProfileController);

export default sellerRouter;