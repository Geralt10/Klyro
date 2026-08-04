import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
  AddressIdParams,
  CreateAddressInput,
  UpdateAddressInput,
} from "./address.validation.js";
import {
  createAddressService,
  deleteAddressService,
  getAddressByIdService,
  getAddressesService,
  getDefaultAddressService,
  setDefaultAddressService,
  updateAddressService,
} from "./address.service.js";

export const createAddressController = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await createAddressService(
      req.user.id,
      req.body as CreateAddressInput
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Address created successfully.",
        address
      )
    );
  }
);

export const getAddressesController = asyncHandler(
  async (req: Request, res: Response) => {
    const addresses = await getAddressesService(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Addresses fetched successfully.",
        addresses
      )
    );
  }
);

export const getAddressByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressId } =
      req.validatedParams as AddressIdParams;

    const address = await getAddressByIdService(
      req.user.id,
      addressId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Address fetched successfully.",
        address
      )
    );
  }
);

export const updateAddressController = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressId } =
      req.validatedParams as AddressIdParams;

    const address = await updateAddressService(
      req.user.id,
      addressId,
      req.body as UpdateAddressInput
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Address updated successfully.",
        address
      )
    );
  }
);

export const deleteAddressController = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressId } =
      req.validatedParams as AddressIdParams;

    const address = await deleteAddressService(
      req.user.id,
      addressId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Address deleted successfully.",
        address
      )
    );
  }
);

export const setDefaultAddressController = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressId } =
      req.validatedParams as AddressIdParams;

    const address = await setDefaultAddressService(
      req.user.id,
      addressId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Default address updated successfully.",
        address
      )
    );
  }
);

export const getDefaultAddressController = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await getDefaultAddressService(
      req.user.id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Default address fetched successfully.",
        address
      )
    );
  }
);
