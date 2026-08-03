import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import { upload } from "../../../config/multer.js";
import { UserRole } from "../../../constants/user.js";
import { validate } from "../../../middlewares/validate.js";
import { changeProductStatusSchema, createProductSchema, productIdParamsSchema, updateProductSchema } from "../product.validation.js";
import { changeProductStatusController, createProductController, getSellerProductByIdController, getSellerProductsController, updateProductController } from "../controllers/sellerProduct.controller.js";
import { getSellerProductsQuerySchema } from "../getSellerProductsQuerySchema.js";
import { validateQuery } from "../../../middlewares/validateQuery.middleware.js";
import { validateParams } from "../../../middlewares/validateParams.middleware.js";





const sellerProductRouter = Router();

sellerProductRouter.post(
  "/",
  authenticate,
  authorize(UserRole.SELLER),
  upload.array("images", 5),
  validate(createProductSchema),
  createProductController
);

sellerProductRouter.get(
  "/",
  authenticate,
  authorize(UserRole.SELLER),
  validateQuery(getSellerProductsQuerySchema),
  getSellerProductsController
);


sellerProductRouter.get(
  "/:productId",
  authenticate,
  authorize(UserRole.SELLER),
  validateParams(productIdParamsSchema),
  getSellerProductByIdController
);

sellerProductRouter.patch(
  "/:productId",
  authenticate,
  authorize(UserRole.SELLER),
  upload.array("images", 5),
  validateParams(productIdParamsSchema),
  validate(updateProductSchema),
  updateProductController
);

sellerProductRouter.patch(
  "/:productId/status",
  authenticate,
  authorize(UserRole.SELLER),
  validateParams(productIdParamsSchema),
  validate(changeProductStatusSchema),
  changeProductStatusController
);


export default sellerProductRouter;