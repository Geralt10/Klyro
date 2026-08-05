import { Schema, Types, model } from "mongoose";
import {
  AddressSnapshot,
  PricingSnapshot,
  ProductSnapshot,
} from "../../types/snapshot.types.js";
import {
  PaymentMethod,
  PaymentStatus,
} from "../payment/payment.enums.js";
import { OrderStatus } from "./order.enums.js";

interface IOrder {
  user: Types.ObjectId;
  orderNumber: string;
  payment: Types.ObjectId;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderItems: ProductSnapshot[];
  shippingAddress: AddressSnapshot;
  pricing: PricingSnapshot;
  confirmedAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSnapshotSchema = new Schema<ProductSnapshot>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const addressSnapshotSchema = new Schema<AddressSnapshot>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    addressType: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const pricingSnapshotSchema = new Schema<PricingSnapshot>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      immutable: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      unique: true,
      immutable: true,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      immutable: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      immutable: true,
    },

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CONFIRMED,
      required: true,
    },

    orderItems: {
      type: [productSnapshotSchema],
      required: true,
    },

    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },

    pricing: {
      type: pricingSnapshotSchema,
      required: true,
    },

    confirmedAt: {
      type: Date,
    },

    dispatchedAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  "orderItems.sellerId": 1,
  createdAt: -1,
});

orderSchema.index({
  "orderItems.sellerId": 1,
  orderStatus: 1,
  deliveredAt: -1,
});

export const orderModel = model<IOrder>("Order", orderSchema);
