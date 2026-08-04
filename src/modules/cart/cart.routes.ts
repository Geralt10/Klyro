import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import { UserRole } from "../../constants/user.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeCartItemController,
  updateCartItemController,
} from "./cart.controller.js";
import {
  addToCartSchema,
  cartItemIdParamsSchema,
  updateCartItemSchema,
} from "./cart.validation.js";

const cartRouter = Router();

cartRouter.post(
  "/items",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validate(addToCartSchema),
  addToCartController
);

cartRouter.get(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  getCartController
);

cartRouter.patch(
  "/items/:cartItemId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(cartItemIdParamsSchema),
  validate(updateCartItemSchema),
  updateCartItemController
);

cartRouter.delete(
  "/items/:cartItemId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(cartItemIdParamsSchema),
  removeCartItemController
);

cartRouter.delete(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  clearCartController
);

export default cartRouter;
