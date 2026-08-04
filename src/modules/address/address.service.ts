import { ApiError } from "../../utils/ApiError.js";
import {
  CreateAddressInput,
  UpdateAddressInput,
} from "./address.validation.js";
import { addressModel } from "./address.model.js";

export const createAddressService = async (
  userId: string,
  data: CreateAddressInput
) => {
  const totalAddresses = await addressModel.countDocuments({
    user: userId,
  });

  if (totalAddresses >= 5) {
    throw new ApiError(
      400,
      "You can add a maximum of 5 addresses."
    );
  }

  const address = await addressModel.create({
    ...data,
    user: userId,
    isDefault: totalAddresses === 0,
  });

  return address;
};

export const getAddressesService = async (
  userId: string
) => {
  return addressModel
    .find({
      user: userId,
    })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();
};

export const getAddressByIdService = async (
  userId: string,
  addressId: string
) => {
  const address = await addressModel
    .findOne({
      _id: addressId,
      user: userId,
    })
    .lean();

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  return address;
};

export const updateAddressService = async (
  userId: string,
  addressId: string,
  data: UpdateAddressInput
) => {
  const address = await addressModel.findOneAndUpdate(
    {
      _id: addressId,
      user: userId,
    },
    data,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  return address;
};

export const deleteAddressService = async (
  userId: string,
  addressId: string
) => {
  const address = await addressModel.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  const wasDefault = address.isDefault;

  await address.deleteOne();

  if (wasDefault) {
    const nextAddress = await addressModel
      .findOne({
        user: userId,
      })
      .sort({
        createdAt: 1,
      });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return address;
};

export const setDefaultAddressService = async (
  userId: string,
  addressId: string
) => {
  const address = await addressModel.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  if (address.isDefault) {
    return address;
  }

  await addressModel.updateMany(
    {
      user: userId,
      isDefault: true,
    },
    {
      $set: {
        isDefault: false,
      },
    }
  );

  address.isDefault = true;
  await address.save();

  return address;
};

export const getDefaultAddressService = async (
  userId: string
) => {
  const address = await addressModel
    .findOne({
      user: userId,
      isDefault: true,
    })
    .lean();

  if (!address) {
    throw new ApiError(404, "Default address not found.");
  }

  return address;
};
