import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { addressModel } from "../address/address.model.js";
import { cartModel } from "../cart/cart.model.js";
import { IProduct } from "../products/product.interface.js";
import { ProductStatus } from "../products/product.enums.js";
import {
  createOrder,
  fetchPayment,
  verifySignature,
} from "../../services/razorpay.service.js";
import {
  CheckoutInput,
  GetPaymentsQuery,
  VerifyPaymentInput,
} from "./payment.validation.js";
import {
  PaymentMethod,
  PaymentStatus,
} from "./payment.enums.js";
import { paymentModel } from "./payment.model.js";

export const checkoutService = async (
  userId: string,
  data: CheckoutInput
) => {
  const [cart, address] = await Promise.all([
    cartModel
      .findOne({
        user: userId,
      })
      .populate("items.product")
      .lean(),

    addressModel
      .findOne({
        _id: data.addressId,
        user: userId,
      })
      .lean(),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  const cartSnapshot = cart.items.map((item) => {
    const product = item.product as unknown as (
      | (IProduct & { _id: Types.ObjectId })
      | null
    );

    if (!product) {
      throw new ApiError(400, "Product is no longer available.");
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new ApiError(400, "Product is not available.");
    }

    const inventoryItem = product.inventory.find(
      (inventory) => inventory.size === item.size
    );

    if (!inventoryItem) {
      throw new ApiError(400, "Product size is not available.");
    }

    if (item.quantity > inventoryItem.stock) {
      throw new ApiError(
        400,
        "Requested quantity exceeds available stock."
      );
    }

    const finalPrice = Number(
      (
        product.basePrice -
        (product.basePrice * product.discountPercentage) / 100
      ).toFixed(2)
    );

    return {
      productId: product._id,
      sellerId: product.seller,
      name: product.name,
      brand: product.brand,
      image: product.images[0].url,
      quantity: item.quantity,
      size: item.size,
      color: product.color,
      unitPrice: product.basePrice,
      discountPercentage: product.discountPercentage,
      finalPrice,
    };
  });

  const subtotal = Number(
    cartSnapshot
      .reduce(
        (total, item) =>
          total + item.unitPrice * item.quantity,
        0
      )
      .toFixed(2)
  );

  const discount = Number(
    cartSnapshot
      .reduce(
        (total, item) =>
          total +
          (item.unitPrice - item.finalPrice) * item.quantity,
        0
      )
      .toFixed(2)
  );

  const shippingCharge = 0;
  const tax = 0;
  const grandTotal = Number(
    (
      subtotal -
      discount +
      shippingCharge +
      tax
    ).toFixed(2)
  );

  const amount = Math.round(grandTotal * 100);

  const addressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    addressType: address.addressType,
  };

  const pricingSnapshot = {
    subtotal,
    discount,
    shippingCharge,
    tax,
    grandTotal,
  };

  if (data.paymentMethod === PaymentMethod.COD) {
    return paymentModel.create({
      user: userId,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.SUCCESS,
      amount,
      currency: "INR",
      cartSnapshot,
      addressSnapshot,
      pricingSnapshot,
      paidAt: new Date(),
    });
  }

  const razorpayOrder = await createOrder({
    amount,
    currency: "INR",
    receipt: `payment_${Date.now()}`,
  });

  const payment = await paymentModel.create({
    user: userId,
    paymentMethod: PaymentMethod.RAZORPAY,
    paymentStatus: PaymentStatus.CREATED,
    amount,
    currency: "INR",
    razorpayOrderId: razorpayOrder.id,
    cartSnapshot,
    addressSnapshot,
    pricingSnapshot,
  });

  return {
    paymentId: payment._id,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: "INR",
  };
};

export const verifyPaymentService = async (
  userId: string,
  data: VerifyPaymentInput
) => {
  const payment = await paymentModel.findOne({
    _id: data.paymentId,
    user: userId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  if (payment.paymentMethod !== PaymentMethod.RAZORPAY) {
    throw new ApiError(400, "Payment method is not Razorpay.");
  }

  if (payment.paymentStatus === PaymentStatus.SUCCESS) {
    if (payment.razorpayPaymentId === data.razorpayPaymentId) {
      return payment;
    }

    throw new ApiError(409, "Payment has already been verified.");
  }

  if (payment.paymentStatus !== PaymentStatus.CREATED) {
    throw new ApiError(400, "Payment cannot be verified.");
  }

  if (payment.razorpayOrderId !== data.razorpayOrderId) {
    throw new ApiError(400, "Razorpay order does not match payment.");
  }

  const isSignatureValid = verifySignature(
    data.razorpayOrderId,
    data.razorpayPaymentId,
    data.razorpaySignature
  );

  if (!isSignatureValid) {
    payment.paymentStatus = PaymentStatus.FAILED;
    payment.failureReason = "Invalid Razorpay signature.";
    await payment.save();

    throw new ApiError(400, "Invalid Razorpay signature.");
  }

  const razorpayPayment = await fetchPayment(
    data.razorpayPaymentId
  );

  if (razorpayPayment.order_id !== payment.razorpayOrderId) {
    throw new ApiError(400, "Razorpay payment does not match order.");
  }

  if (razorpayPayment.status !== "captured") {
    throw new ApiError(400, "Razorpay payment is not captured.");
  }

  if (razorpayPayment.amount !== payment.amount) {
    throw new ApiError(400, "Razorpay payment amount does not match.");
  }

  if (razorpayPayment.currency !== payment.currency) {
    throw new ApiError(400, "Razorpay payment currency does not match.");
  }

  payment.paymentStatus = PaymentStatus.SUCCESS;
  payment.razorpayPaymentId = data.razorpayPaymentId;
  payment.razorpaySignature = data.razorpaySignature;
  payment.paidAt = new Date();
  payment.failureReason = undefined;

  await payment.save();

  return payment;
};

export const getPaymentByIdService = async (
  userId: string,
  paymentId: string
) => {
  const payment = await paymentModel
    .findOne({
      _id: paymentId,
      user: userId,
    })
    .lean();

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  return payment;
};

export const getPaymentsService = async (
  userId: string,
  query: GetPaymentsQuery
) => {
  const skip = (query.page - 1) * query.limit;

  const [totalPayments, payments] = await Promise.all([
    paymentModel.countDocuments({
      user: userId,
    }),

    paymentModel
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
    payments,

    pagination: {
      page: query.page,
      limit: query.limit,
      totalPayments,
      totalPages: Math.ceil(totalPayments / query.limit),
    },
  };
};
