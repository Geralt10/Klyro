import { Router } from "express";
import { UserRole } from "../../constants/user.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { validateParams } from "../../middlewares/validateParams.middleware.js";
import {
  createAddressController,
  deleteAddressController,
  getAddressByIdController,
  getAddressesController,
  getDefaultAddressController,
  setDefaultAddressController,
  updateAddressController,
} from "./address.controller.js";
import {
  addressIdParamsSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation.js";

const addressRouter = Router();

addressRouter.post(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validate(createAddressSchema),
  createAddressController
);

addressRouter.get(
  "/",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  getAddressesController
);

addressRouter.get(
  "/default",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  getDefaultAddressController
);

addressRouter.get(
  "/:addressId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(addressIdParamsSchema),
  getAddressByIdController
);

addressRouter.patch(
  "/:addressId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(addressIdParamsSchema),
  validate(updateAddressSchema),
  updateAddressController
);

addressRouter.patch(
  "/:addressId/default",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(addressIdParamsSchema),
  setDefaultAddressController
);

addressRouter.delete(
  "/:addressId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.SELLER),
  validateParams(addressIdParamsSchema),
  deleteAddressController
);

export default addressRouter;
