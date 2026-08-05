import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
  CreateOrderInput,
  GetOrdersQuery,
  OrderIdParams,
  SellerOrderParams,
  SellerOrdersQuery,
  UpdateSellerOrderStatusInput,
} from "./order.validation.js";
import {
  cancelOrderService,
  createOrderService,
  getOrderByIdService,
  getOrdersService,
  getSellerManagedOrdersService,
  getSellerOrderByNumberService,
  getSellerOrdersService,
  updateSellerOrderStatusService,
} from "./order.service.js";

export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await createOrderService(
      req.user.id,
      req.body as CreateOrderInput
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Order created successfully.",
        order
      )
    );
  }
);

export const getOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getOrdersService(
      req.user.id,
      req.validatedQuery as GetOrdersQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Orders fetched successfully.",
        result
      )
    );
  }
);

export const getOrderByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.validatedParams as OrderIdParams;

    const order = await getOrderByIdService(
      req.user.id,
      orderId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order fetched successfully.",
        order
      )
    );
  }
);

export const getSellerOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getSellerOrdersService(
      req.user.id,
      req.validatedQuery as GetOrdersQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller orders fetched successfully.",
        result
      )
    );
  }
);

export const cancelOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.validatedParams as OrderIdParams;

    const order = await cancelOrderService(
      req.user.id,
      orderId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order cancelled successfully.",
        order
      )
    );
  }
);

export const getSellerManagedOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getSellerManagedOrdersService(
      req.user.id,
      req.validatedQuery as SellerOrdersQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller orders fetched successfully.",
        result
      )
    );
  }
);

export const getSellerOrderByNumberController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderNumber } =
      req.validatedParams as SellerOrderParams;

    const order = await getSellerOrderByNumberService(
      req.user.id,
      orderNumber
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seller order fetched successfully.",
        order
      )
    );
  }
);

export const updateSellerOrderStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderNumber } =
      req.validatedParams as SellerOrderParams;

    const order = await updateSellerOrderStatusService(
      req.user.id,
      orderNumber,
      req.body as UpdateSellerOrderStatusInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order status updated successfully.",
        order
      )
    );
  }
);
