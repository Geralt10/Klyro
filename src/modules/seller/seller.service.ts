import mongoose, { Types } from "mongoose";

import { sellerModel } from "./seller.model.js";
import { userModel } from "../auth/user.model.js";

import { CreateSellerInput, UpdateSellerInput } from "./seller.validation.js";

import { ApiError } from "../../utils/ApiError.js";
import { UserRole } from "../../constants/user.js";
import { deleteImage, uploadImage } from "../../services/image.service.js";
import { DEFAULT_SELLER_IMAGE } from "../../constants/image.js";
import { logger } from "../../config/logger.js";


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

//getSeller
export const getSellerProfileService = async (
  userId: Types.ObjectId
) => {
    const seller = await sellerModel.findOne({ userId });

    if (!seller) {
        throw new ApiError(404, "Seller profile not found.");
    }

    return seller;
}

//updateSellerProfile
export const updateSellerProfileService = async (
  userId: Types.ObjectId,
  data: UpdateSellerInput
) => {
  const seller = await sellerModel.findOne({ userId });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  if (
    data.storeName !== undefined &&
    data.storeName !== seller.storeName
  ) {
    const existingStore = await sellerModel.findOne({
      storeName: data.storeName,
    });

    if (existingStore) {
      throw new ApiError(409, "Store name already exists.");
    }
  }

  seller.set(data);

  await seller.save();

  return seller;
};

//updateLogo
export const updateSellerLogoService = async (
  userId: Types.ObjectId,
  buffer: Buffer,
  originalFilename: string
) => {
  const seller = await sellerModel.findOne({ userId });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const oldLogo = seller.logo;

  const uploadedLogo = await uploadImage(
    buffer,
    originalFilename,
    "seller/logo"
  );

  seller.logo = uploadedLogo;

  await seller.save();

  if (oldLogo.fileId !== DEFAULT_SELLER_IMAGE.fileId) {
    try {
      await deleteImage(oldLogo.fileId);
    } catch (error) {
      logger.error(
        {
          err: error,
          sellerId: seller._id,
          fileId: oldLogo.fileId,
        },
        "Failed to delete old seller logo."
      );
    }
  }

  return seller;
};

//updateBanner
export const updateSellerBannerService = async (
  userId: Types.ObjectId,
  buffer: Buffer,
  originalFilename: string
) => {
  const seller = await sellerModel.findOne({ userId });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const oldBanner = { ...seller.banner };

  const uploadedBanner = await uploadImage(
    buffer,
    originalFilename,
    "seller/banner"
  );

  seller.banner = uploadedBanner;

  await seller.save();

  if (oldBanner.fileId !== DEFAULT_SELLER_IMAGE.fileId) {
    try {
      await deleteImage(oldBanner.fileId);
    } catch (error) {
      logger.error(
        {
          err: error,
          sellerId: seller._id,
          fileId: oldBanner.fileId,
        },
        "Failed to delete old seller banner."
      );
    }
  }

  return seller;
};