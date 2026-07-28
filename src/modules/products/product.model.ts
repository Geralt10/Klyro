import mongoose, { Schema } from "mongoose";

import { IProduct } from "./product.interface.js";

import {
  ProductCategory,
  ProductFit,
  ProductGender,
  ProductSize,
  ProductStatus,
} from "./product.enums.js";

const ProductImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    fileId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const ProductInventorySchema = new Schema(
  {
    size: {
      type: String,
      enum: Object.values(ProductSize),
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);



const ProductSchema = new Schema<IProduct>(
  {
    seller: {
  type: Schema.Types.ObjectId,
  ref: "Seller",
  required: true,
  index: true,
},

name: {
  type: String,
  required: true,
  trim: true,
},

slug: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
},

description: {
  type: String,
  required: true,
  trim: true,
},

brand: {
  type: String,
  required: true,
  trim: true,
},

gender: {
  type: String,
  enum: Object.values(ProductGender),
  required: true,
},

category: {
  type: String,
  enum: Object.values(ProductCategory),
  required: true,
},

fit: {
  type: String,
  enum: Object.values(ProductFit),
  required: true,
},

color: {
  type: String,
  required: true,
  trim: true,
},

basePrice: {
  type: Number,
  required: true,
  min: 0,
},

discountPercentage: {
  type: Number,
  default: 0,
  min: 0,
  max: 100,
},

inventory: {
  type: [ProductInventorySchema],
  required: true,
},

images: {
  type: [ProductImageSchema],
  required: true,
},

status: {
  type: String,
  enum: Object.values(ProductStatus),
  default: ProductStatus.DRAFT,
},
  },
    {
     timestamps: true,

     versionKey: false,

     toJSON: {
     virtuals: true,
    },

    toObject: {
     virtuals: true,
    },
   }
);


ProductSchema.index(
  {
    seller: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

ProductSchema.virtual("finalPrice").get(function () {
  return (
    this.basePrice -
    (this.basePrice * this.discountPercentage) / 100
  );
});

export const Product = mongoose.model<IProduct>("Product",ProductSchema);