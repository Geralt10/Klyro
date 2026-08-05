import { Router } from "express";
import { UserRole } from "../../constants/user.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import { validateQuery } from "../../middlewares/validateQuery.middleware.js";
import {
  getSellerManagedOrdersController,
  getSellerOrderByNumberController,
  updateSellerOrderStatusController,
} from "./order.controller.js";
import {
  sellerOrderParamsSchema,
  sellerOrdersQuerySchema,
  updateSellerOrderStatusSchema,
} from "./order.validation.js";

const sellerOrderRouter = Router();

sellerOrderRouter.get(
  "/",
  authenticate,
  authorize(UserRole.SELLER),
  validateQuery(sellerOrdersQuerySchema),
  getSellerManagedOrdersController
);

sellerOrderRouter.get(
  "/:orderNumber",
  authenticate,
  authorize(UserRole.SELLER),
  validateParams(sellerOrderParamsSchema),
  getSellerOrderByNumberController
);

sellerOrderRouter.patch(
  "/:orderNumber/status",
  authenticate,
  authorize(UserRole.SELLER),
  validateParams(sellerOrderParamsSchema),
  validate(updateSellerOrderStatusSchema),
  updateSellerOrderStatusController
);

export default sellerOrderRouter;
