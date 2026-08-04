import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import { validateParams } from "../../../middlewares/validateParams.middleware.js";
import { validateQuery } from "../../../middlewares/validateQuery.middleware.js";
import { UserRole } from "../../../constants/user.js";
import {
  getAdminProductByIdController,
  getAdminProductsController,
} from "../controllers/adminProduct.controller.js";
import { getAdminProductsQuerySchema } from "../getProductsQuerySchema.js";
import { productIdParamsSchema } from "../product.validation.js";

const adminProductRouter = Router();

adminProductRouter.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateQuery(getAdminProductsQuerySchema),
  getAdminProductsController
);

adminProductRouter.get(
  "/:productId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(productIdParamsSchema),
  getAdminProductByIdController
);

export default adminProductRouter;