import { Router } from "express";
import { getProductQuerySchema } from "../getProductsQuerySchema.js";
import { getBuyerProductsController } from "../controllers/buyerProduct.controller.js";
import { validateQuery } from "../../../middlewares/validateQuery.middleware.js";


const buyerRouter = Router()


buyerRouter.get(
  "/",
  validateQuery(getProductQuerySchema),
  getBuyerProductsController
);

export default buyerRouter;