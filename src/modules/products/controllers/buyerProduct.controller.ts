import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { GetProductsQuery } from "../getProductsQuerySchema.js";
import { getBuyerProductsService } from "../services/buyerProduct.service.js";





export const getBuyerProductsController =
  asyncHandler(async (req, res) => {
    const query =
      req.validatedQuery as GetProductsQuery;

    const result =
      await getBuyerProductsService(query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Products fetched successfully.",
        result
      )
    );
  });