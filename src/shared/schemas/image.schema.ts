import { Schema } from "mongoose";

export interface IImage {
  url: string;
  fileId: string;
}

export const imageSchema = new Schema<IImage>(
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