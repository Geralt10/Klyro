import { Schema, Types, model } from "mongoose";
import { IImage, imageSchema } from "../../shared/schemas/image.schema.js";

interface IBusinessAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ISeller {
  userId: Types.ObjectId;

  storeName: string;

  businessName: string;

  description?: string;

  businessAddress: IBusinessAddress;

  logo?: IImage;

  banner?: IImage;

  isActive: boolean;
}

const sellerSchema = new Schema<ISeller>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    storeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    businessAddress: {
      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine2: {
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

      country: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    logo: {
      type: imageSchema,
       default: {
        url: "https://ik.imagekit.io/geralt7895/default/user.png",
        fileId: "6a53dbcb5c7cd75eb81566d7",
  },
    },

    banner: {
      type: imageSchema,
      default: {
        url: "https://ik.imagekit.io/geralt7895/default/user.png",
        fileId: "6a53dbcb5c7cd75eb81566d7",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
},
  {
    timestamps: true,
  }
);

export const sellerModel = model<ISeller>("Seller", sellerSchema);