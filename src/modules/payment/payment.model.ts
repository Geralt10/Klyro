import { Schema, Types, model } from "mongoose";
import {
  PaymentMethod,
  PaymentStatus,
} from "./payment.enums.js";

interface ICartSnapshotItem {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  name: string;
  brand: string;
  image: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  discountPercentage: number;
  finalPrice: number;
}

interface IAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
}

interface IPricingSnapshot {
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  grandTotal: number;
}

interface IPayment {
  user: Types.ObjectId;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  cartSnapshot: ICartSnapshotItem[];
  addressSnapshot: IAddressSnapshot;
  pricingSnapshot: IPricingSnapshot;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
}

const cartSnapshotSchema = new Schema<ICartSnapshotItem>(
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

const addressSnapshotSchema = new Schema<IAddressSnapshot>(
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

const pricingSnapshotSchema = new Schema<IPricingSnapshot>(
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

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      immutable: true,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      trim: true,
    },

    cartSnapshot: {
      type: [cartSnapshotSchema],
      required: true,
    },

    addressSnapshot: {
      type: addressSnapshotSchema,
      required: true,
    },

    pricingSnapshot: {
      type: pricingSnapshotSchema,
      required: true,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  user: 1,
  createdAt: -1,
});

export const paymentModel = model<IPayment>(
  "Payment",
  paymentSchema
);
