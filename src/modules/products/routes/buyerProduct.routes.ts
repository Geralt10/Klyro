import { Router } from "express";
import { getProductQuerySchema } from "../getProductsQuerySchema.js";
import { getBuyerProductByIdController, getBuyerProductsController } from "../controllers/buyerProduct.controller.js";
import { validateQuery } from "../../../middlewares/validateQuery.middleware.js";
import { validateParams } from "../../../middlewares/validateParams.middleware.js";
import { productIdParamsSchema } from "../product.validation.js";


const buyerRouter = Router()


buyerRouter.get(
  "/",
  validateQuery(getProductQuerySchema),
  getBuyerProductsController
);

buyerRouter.get(
  "/:productId",
  validateParams(productIdParamsSchema),
  getBuyerProductByIdController
);

export default buyerRouter;