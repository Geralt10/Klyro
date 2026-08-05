import { Schema, Types, model } from "mongoose";
import { AddressType } from "./address.enums.js";

interface IAddress {
  user: Types.ObjectId;

  fullName: string;

  phone: string;

  addressLine1: string;

  addressLine2?: string;

  landmark?: string;

  city: string;

  state: string;

  postalCode: string;

  country: string;

  addressType: AddressType;

  isDefault: boolean;
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

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
      default: "India",
      immutable: true,
    },

    addressType: {
      type: String,
      enum: Object.values(AddressType),
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index(
  {
    user: 1,
    isDefault: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
    },
  }
);

addressSchema.index({
  user: 1,
  isDefault: -1,
  createdAt: -1,
});

export const addressModel = model<IAddress>(
  "Address",
  addressSchema
);
