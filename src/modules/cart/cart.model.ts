import { Schema, Types, model } from "mongoose";
import { ProductSize } from "../products/product.enums.js";

interface ICartItem {
  _id?: Types.ObjectId;

  product: Types.ObjectId;

  size: ProductSize;

  quantity: number;
}

interface ICart {
  user: Types.ObjectId;

  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  size: {
    type: String,
    enum: Object.values(ProductSize),
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const cartModel = model<ICart>("Cart", cartSchema);
