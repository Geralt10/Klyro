import crypto from "crypto";
import { env } from "../config/config.js";
import { razorpay } from "../config/razorpay.js";

export const createOrder = async (
  data: {
    amount: number;
    currency: string;
    receipt: string;
  }
) => {
  return razorpay.orders.create(data);
};

export const verifySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(razorpaySignature, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
};

export const fetchPayment = async (
  razorpayPaymentId: string
) => {
  return razorpay.payments.fetch(razorpayPaymentId);
};

export const refund = async (
  razorpayPaymentId: string
) => {
  return razorpay.payments.refund(razorpayPaymentId, {});
};
