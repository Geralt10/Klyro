import mongoose, { Types } from "mongoose";

import { sellerModel } from "./seller.model.js";
import { userModel } from "../auth/user.model.js";

import { CreateSellerInput } from "./seller.validation.js";

import { ApiError } from "../../utils/ApiError.js";
import { UserRole } from "../../constants/user.js";


//createSeller
export const createSellerService = async (
  userId: Types.ObjectId,
  data: CreateSellerInput
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await userModel.findById(userId).session(session);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const existingSeller = await sellerModel
        .findOne({ userId })
        .session(session);

    if (existingSeller) {
        throw new ApiError(409, "Seller profile already exists.");
    }

    const existingStore = await sellerModel
        .findOne({ storeName: data.storeName })
        .session(session);

    if (existingStore) {
        throw new ApiError(409, "Store name already exists.");
    }

    const seller = new sellerModel({
        userId,
        ...data,
    });

    await seller.save({ session });

    user.role = UserRole.SELLER;

    await user.save({ session });

    await session.commitTransaction();

    return seller;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};