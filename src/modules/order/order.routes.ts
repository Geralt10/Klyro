import { Router } from "express";
import { UserRole } from "../../constants/user.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import { validateQuery } from "../../middlewares/validateQuery.middleware.js";
import {
  cancelOrderController,
  createOrderController,
  getOrderByIdController,
  getOrdersController,
  getSellerOrdersController,
} from "./order.controller.js";
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderIdParamsSchema,
} from "./order.validation.js";

const orderRouter = Router();

orderRouter.post(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validate(createOrderSchema),
  createOrderController
);

orderRouter.get(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateQuery(getOrdersQuerySchema),
  getOrdersController
);

orderRouter.patch(
  "/:orderId/cancel",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(orderIdParamsSchema),
  cancelOrderController
);

orderRouter.get(
  "/seller",
  authenticate,
  authorize(UserRole.SELLER),
  validateQuery(getOrdersQuerySchema),
  getSellerOrdersController
);

orderRouter.get(
  "/:orderId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(orderIdParamsSchema),
  getOrderByIdController
);

export default orderRouter;
