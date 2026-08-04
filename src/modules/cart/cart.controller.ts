import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
  AddToCartInput,
  CartItemIdParams,
  UpdateCartItemInput,
} from "./cart.validation.js";
import {
  addToCartService,
  clearCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService,
} from "./cart.service.js";

export const addToCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await addToCartService(
      req.user.id,
      req.user.role,
      req.body as AddToCartInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product added to cart successfully.",
        cart
      )
    );
  }
);

export const getCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await getCartService(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart fetched successfully.",
        cart
      )
    );
  }
);

export const updateCartItemController = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartItemId } =
      req.validatedParams as CartItemIdParams;

    const cart = await updateCartItemService(
      req.user.id,
      cartItemId,
      req.body as UpdateCartItemInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart item updated successfully.",
        cart
      )
    );
  }
);

export const removeCartItemController = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartItemId } =
      req.validatedParams as CartItemIdParams;

    const cart = await removeCartItemService(
      req.user.id,
      cartItemId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart item removed successfully.",
        cart
      )
    );
  }
);

export const clearCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await clearCartService(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart cleared successfully.",
        cart
      )
    );
  }
);
