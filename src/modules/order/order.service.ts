import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { cartModel } from "../cart/cart.model.js";
import { paymentModel } from "../payment/payment.model.js";
import {
  PaymentMethod,
  PaymentStatus,
} from "../payment/payment.enums.js";
import { productModel } from "../products/product.model.js";
import { sellerModel } from "../seller/seller.model.js";
import { refund } from "../../services/razorpay.service.js";
import {
  CreateOrderInput,
  GetOrdersQuery,
  SellerOrdersQuery,
  UpdateSellerOrderStatusInput,
} from "./order.validation.js";
import { OrderStatus } from "./order.enums.js";
import { orderModel } from "./order.model.js";

export const createOrderService = async (
  userId: string,
  data: CreateOrderInput
) => {
  const payment = await paymentModel
    .findOne({
      _id: data.paymentId,
      user: userId,
    })
    .lean();

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  if (payment.paymentStatus !== PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Payment is not successful.");
  }

  const existingOrder = await orderModel.exists({
    payment: payment._id,
  });

  if (existingOrder) {
    throw new ApiError(
      409,
      "Order already exists for this payment."
    );
  }

  const date = new Date();
  const datePart = `${date.getFullYear()}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();
  const orderNumber = `ORD-${datePart}-${randomPart}`;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const item of payment.cartSnapshot) {
        const product = await productModel
          .findById(item.productId)
          .session(session);

        if (!product) {
          throw new ApiError(400, "Product is no longer available.");
        }

        const inventoryItem = product.inventory.find(
          (inventory) => inventory.size === item.size
        );

        if (!inventoryItem) {
          throw new ApiError(400, "Product size is not available.");
        }

        if (inventoryItem.stock < item.quantity) {
          throw new ApiError(
            400,
            "Requested quantity exceeds available stock."
          );
        }

        inventoryItem.stock -= item.quantity;

        await product.save({ session });
      }

      await orderModel.create(
        [
          {
            user: userId,
            orderNumber,
            payment: payment._id,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            orderStatus: OrderStatus.CONFIRMED,
            orderItems: payment.cartSnapshot,
            shippingAddress: payment.addressSnapshot,
            pricing: payment.pricingSnapshot,
            confirmedAt: new Date(),
          },
        ],
        {
          session,
        }
      );

      await cartModel.updateOne(
        {
          user: userId,
        },
        {
          $set: {
            items: [],
          },
        },
        {
          session,
        }
      );
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new ApiError(
        409,
        "Order already exists for this payment."
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }

  const order = await orderModel
    .findOne({
      payment: payment._id,
    })
    .lean();

  if (!order) {
    throw new ApiError(500, "Failed to create order.");
  }

  return order;
};

export const getOrdersService = async (
  userId: string,
  query: GetOrdersQuery
) => {
  const skip = (query.page - 1) * query.limit;

  const [totalOrders, orders] = await Promise.all([
    orderModel.countDocuments({
      user: userId,
    }),

    orderModel
      .find({
        user: userId,
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    orders,

    pagination: {
      page: query.page,
      limit: query.limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / query.limit),
    },
  };
};

export const getOrderByIdService = async (
  userId: string,
  orderId: string
) => {
  const order = await orderModel
    .findOne({
      orderNumber: orderId,
      user: userId,
    })
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return order;
};

export const getSellerOrdersService = async (
  userId: string,
  query: GetOrdersQuery
) => {
  const seller = await sellerModel.findOne({
    userId,
  });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const filter = {
    "orderItems.sellerId": seller._id,
  };
  const skip = (query.page - 1) * query.limit;

  const [totalOrders, orders] = await Promise.all([
    orderModel.countDocuments(filter),

    orderModel
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    orders: orders.map((order) => ({
      orderNumber: order.orderNumber,
      payment: order.payment,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderItems: order.orderItems.filter((item) =>
        item.sellerId.equals(seller._id)
      ),
      shippingAddress: order.shippingAddress,
      pricing: order.pricing,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      dispatchedAt: order.dispatchedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    })),

    pagination: {
      page: query.page,
      limit: query.limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / query.limit),
    },
  };
};

export const cancelOrderService = async (
  userId: string,
  orderId: string
) => {
  const order = await orderModel
    .findOne({
      orderNumber: orderId,
      user: userId,
    })
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.orderStatus === OrderStatus.CANCELLED) {
    throw new ApiError(400, "Order is already cancelled.");
  }

  if (
    order.orderStatus !== OrderStatus.CONFIRMED &&
    order.orderStatus !== OrderStatus.PROCESSING
  ) {
    throw new ApiError(400, "Order cannot be cancelled.");
  }

  if (order.paymentMethod === PaymentMethod.RAZORPAY) {
    const payment = await paymentModel.findOne({
      _id: order.payment,
      user: userId,
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    if (payment.paymentStatus !== PaymentStatus.SUCCESS) {
      throw new ApiError(400, "Payment is not refundable.");
    }

    if (!payment.razorpayPaymentId) {
      throw new ApiError(400, "Razorpay payment not found.");
    }

    await refund(payment.razorpayPaymentId);
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const orderInTransaction = await orderModel
        .findOne({
          orderNumber: orderId,
          user: userId,
        })
        .session(session);

      if (!orderInTransaction) {
        throw new ApiError(404, "Order not found.");
      }

      if (orderInTransaction.orderStatus === OrderStatus.CANCELLED) {
        throw new ApiError(400, "Order is already cancelled.");
      }

      if (
        orderInTransaction.orderStatus !== OrderStatus.CONFIRMED &&
        orderInTransaction.orderStatus !== OrderStatus.PROCESSING
      ) {
        throw new ApiError(400, "Order cannot be cancelled.");
      }

      for (const item of orderInTransaction.orderItems) {
        const product = await productModel
          .findById(item.productId)
          .session(session);

        if (!product) {
          throw new ApiError(404, "Product not found.");
        }

        const inventoryItem = product.inventory.find(
          (inventory) => inventory.size === item.size
        );

        if (!inventoryItem) {
          throw new ApiError(400, "Product size is not available.");
        }

        inventoryItem.stock += item.quantity;

        await product.save({ session });
      }

      if (orderInTransaction.paymentMethod === PaymentMethod.RAZORPAY) {
        const payment = await paymentModel
          .findOne({
            _id: orderInTransaction.payment,
            user: userId,
          })
          .session(session);

        if (!payment) {
          throw new ApiError(404, "Payment not found.");
        }

        if (payment.paymentStatus !== PaymentStatus.SUCCESS) {
          throw new ApiError(400, "Payment is not refundable.");
        }

        payment.paymentStatus = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();

        await payment.save({ session });
      }

      orderInTransaction.orderStatus = OrderStatus.CANCELLED;
      orderInTransaction.cancelledAt = new Date();

      await orderInTransaction.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const cancelledOrder = await orderModel
    .findOne({
      orderNumber: orderId,
      user: userId,
    })
    .lean();

  if (!cancelledOrder) {
    throw new ApiError(500, "Failed to cancel order.");
  }

  return cancelledOrder;
};

export const getSellerManagedOrdersService = async (
  userId: string,
  query: SellerOrdersQuery
) => {
  const seller = await sellerModel.findOne({
    userId,
  });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const filter: Record<string, unknown> = {
    "orderItems.sellerId": seller._id,
  };

  if (query.status) {
    filter.orderStatus = query.status;
  }

  const skip = (query.page - 1) * query.limit;

  const [totalOrders, orders] = await Promise.all([
    orderModel.countDocuments(filter),

    orderModel
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    orders: orders.map((order) => ({
      orderNumber: order.orderNumber,
      payment: order.payment,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderItems: order.orderItems.filter((item) =>
        item.sellerId.equals(seller._id)
      ),
      shippingAddress: order.shippingAddress,
      pricing: order.pricing,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      dispatchedAt: order.dispatchedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    })),

    pagination: {
      page: query.page,
      limit: query.limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / query.limit),
    },
  };
};

export const getSellerOrderByNumberService = async (
  userId: string,
  orderNumber: string
) => {
  const seller = await sellerModel.findOne({
    userId,
  });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const order = await orderModel
    .findOne({
      orderNumber,
      "orderItems.sellerId": seller._id,
    })
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return {
    orderNumber: order.orderNumber,
    payment: order.payment,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    orderItems: order.orderItems.filter((item) =>
      item.sellerId.equals(seller._id)
    ),
    shippingAddress: order.shippingAddress,
    pricing: order.pricing,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    confirmedAt: order.confirmedAt,
    dispatchedAt: order.dispatchedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
  };
};

export const updateSellerOrderStatusService = async (
  userId: string,
  orderNumber: string,
  data: UpdateSellerOrderStatusInput
) => {
  const seller = await sellerModel.findOne({
    userId,
  });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const order = await orderModel.findOne({
    orderNumber,
    "orderItems.sellerId": seller._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const isValidTransition =
    (order.orderStatus === OrderStatus.CONFIRMED &&
      data.status === OrderStatus.PROCESSING) ||
    (order.orderStatus === OrderStatus.PROCESSING &&
      data.status === OrderStatus.DISPATCHED) ||
    (order.orderStatus === OrderStatus.DISPATCHED &&
      data.status === OrderStatus.DELIVERED);

  if (!isValidTransition) {
    throw new ApiError(400, "Invalid order status transition.");
  }

  order.orderStatus = data.status;

  if (data.status === OrderStatus.DISPATCHED) {
    order.dispatchedAt = new Date();
  }

  if (data.status === OrderStatus.DELIVERED) {
    order.deliveredAt = new Date();
  }

  await order.save();

  return {
    orderNumber: order.orderNumber,
    payment: order.payment,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    orderItems: order.orderItems.filter((item) =>
      item.sellerId.equals(seller._id)
    ),
    shippingAddress: order.shippingAddress,
    pricing: order.pricing,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    confirmedAt: order.confirmedAt,
    dispatchedAt: order.dispatchedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
  };
};
