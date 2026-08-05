import { Router } from "express";
import { UserRole } from "../../constants/user.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { getSellerDashboardController } from "./seller.dashboard.controller.js";

const sellerDashboardRouter = Router();

sellerDashboardRouter.get(
  "/",
  authenticate,
  authorize(UserRole.SELLER),
  getSellerDashboardController
);

export default sellerDashboardRouter;
