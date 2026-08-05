import { Router } from "express";
import { UserRole } from "../../constants/user.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import { validateQuery } from "../../middlewares/validateQuery.middleware.js";
import {
  checkoutController,
  getPaymentByIdController,
  getPaymentsController,
  verifyPaymentController,
} from "./payment.controller.js";
import {
  checkoutSchema,
  getPaymentsQuerySchema,
  paymentIdParamsSchema,
  verifyPaymentSchema,
} from "./payment.validation.js";

const paymentRouter = Router();

paymentRouter.post(
  "/checkout",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validate(checkoutSchema),
  checkoutController
);

paymentRouter.post(
  "/verify",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validate(verifyPaymentSchema),
  verifyPaymentController
);

paymentRouter.get(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateQuery(getPaymentsQuerySchema),
  getPaymentsController
);

paymentRouter.get(
  "/:paymentId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(paymentIdParamsSchema),
  getPaymentByIdController
);

export default paymentRouter;
