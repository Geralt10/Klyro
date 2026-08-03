import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import { upload } from "../../../config/multer.js";
import { UserRole } from "../../../constants/user.js";
import { validate } from "../../../middlewares/validate.js";
import { createProductSchema } from "../product.validation.js";
import { createProductController } from "../controllers/sellerProduct.controller.js";





const sellerProductRouter = Router();

sellerProductRouter.post(
  "/",
  authenticate,
  authorize(UserRole.SELLER),
  upload.array("images", 5),
  validate(createProductSchema),
  createProductController
);


export default sellerProductRouter;