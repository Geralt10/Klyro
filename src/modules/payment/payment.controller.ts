import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
  CheckoutInput,
  GetPaymentsQuery,
  PaymentIdParams,
  VerifyPaymentInput,
} from "./payment.validation.js";
import {
  checkoutService,
  getPaymentByIdService,
  getPaymentsService,
  verifyPaymentService,
} from "./payment.service.js";

export const checkoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await checkoutService(
      req.user.id,
      req.body as CheckoutInput
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Checkout initiated successfully.",
        payment
      )
    );
  }
);

export const verifyPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await verifyPaymentService(
      req.user.id,
      req.body as VerifyPaymentInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment verified successfully.",
        payment
      )
    );
  }
);

export const getPaymentByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } =
      req.validatedParams as PaymentIdParams;

    const payment = await getPaymentByIdService(
      req.user.id,
      paymentId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment fetched successfully.",
        payment
      )
    );
  }
);

export const getPaymentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const payments = await getPaymentsService(
      req.user.id,
      req.validatedQuery as GetPaymentsQuery
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payments fetched successfully.",
        payments
      )
    );
  }
);
