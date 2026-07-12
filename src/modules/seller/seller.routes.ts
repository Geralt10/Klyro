import { Router } from "express";

import { createSellerController, getSellerProfileController, updateSellerBannerController, updateSellerLogoController, updateSellerProfileController } from "./seller.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";

import { createSellerSchema, updateSellerSchema } from "./seller.validation.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../constants/user.js";
import { upload } from "../../config/multer.js";

const sellerRouter = Router();

sellerRouter.post("/",authenticate,validate(createSellerSchema),createSellerController);

sellerRouter.get("/",authenticate,authorize(UserRole.SELLER),getSellerProfileController);

sellerRouter.patch("/",authenticate,authorize(UserRole.SELLER),validate(updateSellerSchema),updateSellerProfileController);

sellerRouter.patch("/logo",authenticate,authorize(UserRole.SELLER),upload.single("logo"),updateSellerLogoController);

sellerRouter.patch("/banner",authenticate,authorize(UserRole.SELLER),upload.single("banner"),updateSellerBannerController);

export default sellerRouter;