import { Types } from "mongoose";
import { UserRole } from "../../constants/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { sellerModel } from "../seller/seller.model.js";
import { IProduct } from "../products/product.interface.js";
import { ProductStatus } from "../products/product.enums.js";
import { productModel } from "../products/product.model.js";
import {
  AddToCartInput,
  UpdateCartItemInput,
} from "./cart.validation.js";
import { cartModel } from "./cart.model.js";

export const addToCartService = async (
  userId: string,
  userRole: UserRole,
  data: AddToCartInput
) => {
  const product = await productModel
    .findOne({
      _id: data.productId,
      status: ProductStatus.ACTIVE,
    })
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (userRole === UserRole.SELLER) {
    const seller = await sellerModel.findOne({
      userId,
    });

    if (seller && product.seller.equals(seller._id)) {
      throw new ApiError(
        400,
        "You cannot add your own product to cart."
      );
    }
  }

  const inventoryItem = product.inventory.find(
    (item) => item.size === data.size
  );

  if (!inventoryItem) {
    throw new ApiError(400, "Product size is not available.");
  }

  const cart = await cartModel.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $setOnInsert: {
        user: userId,
        items: [],
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  const existingCartItem = cart.items.find(
    (item) =>
      item.product.equals(data.productId) &&
      item.size === data.size
  );

  const quantity = existingCartItem
    ? existingCartItem.quantity + data.quantity
    : data.quantity;

  if (quantity > inventoryItem.stock) {
    throw new ApiError(
      400,
      "Requested quantity exceeds available stock."
    );
  }

  if (existingCartItem) {
    existingCartItem.quantity = quantity;
  } else {
    cart.items.push({
      product: product._id,
      size: data.size,
      quantity: data.quantity,
    });
  }

  await cart.save();

  return getCartService(userId);
};

export const getCartService = async (
  userId: string
) => {
  const cart = await cartModel
    .findOneAndUpdate(
      {
        user: userId,
      },
      {
        $setOnInsert: {
          user: userId,
          items: [],
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    )
    .populate("items.product")
    .lean();

  const items = cart.items.map((item) => {
    const product = item.product as unknown as (
      | (IProduct & { _id: Types.ObjectId })
      | null
    );

    return {
      ...item,
      product,
      isAvailable:
        product?.status === ProductStatus.ACTIVE,
    };
  });

  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return {
    items,
    totalItems,
  };
};

export const updateCartItemService = async (
  userId: string,
  cartItemId: string,
  data: UpdateCartItemInput
) => {
  const cart = await cartModel.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart item not found.");
  }

  const cartItem = cart.items.find((item) =>
    item._id?.equals(cartItemId)
  );

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found.");
  }

  const product = await productModel
    .findById(cartItem.product)
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.status !== ProductStatus.ACTIVE) {
    throw new ApiError(400, "Product is not available.");
  }

  const inventoryItem = product.inventory.find(
    (item) => item.size === cartItem.size
  );

  if (!inventoryItem) {
    throw new ApiError(400, "Product size is not available.");
  }

  if (data.quantity > inventoryItem.stock) {
    throw new ApiError(
      400,
      "Requested quantity exceeds available stock."
    );
  }

  cartItem.quantity = data.quantity;

  await cart.save();

  return getCartService(userId);
};

export const removeCartItemService = async (
  userId: string,
  cartItemId: string
) => {
  const cart = await cartModel.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart item not found.");
  }

  const cartItem = cart.items.find((item) =>
    item._id?.equals(cartItemId)
  );

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found.");
  }

  cart.items = cart.items.filter(
    (item) => !item._id?.equals(cartItemId)
  );

  await cart.save();

  return getCartService(userId);
};

export const clearCartService = async (
  userId: string
) => {
  await cartModel.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        items: [],
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return getCartService(userId);
};
