import { QueryFilter, SortOrder } from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import {
  GetAdminProductsQuery,
} from "../getProductsQuerySchema.js";
import { IProduct } from "../product.interface.js";
import {
  ProductSort,
} from "../product.enums.js";
import { productModel } from "../product.model.js";

export const getAdminProductsService = async (
  query: GetAdminProductsQuery
) => {
  const {
    page,
    limit,
    search,
    category,
    status,
    sellerId,
    sort,
  } = query;

  const filter: QueryFilter<IProduct> = {};

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (sellerId) {
    filter.seller = sellerId;
  }

  const sortMap: Record<
    ProductSort,
    Record<string, SortOrder>
  > = {
    [ProductSort.NEWEST]: {
      createdAt: -1,
    },

    [ProductSort.OLDEST]: {
      createdAt: 1,
    },

    [ProductSort.PRICE_ASC]: {
      basePrice: 1,
    },

    [ProductSort.PRICE_DESC]: {
      basePrice: -1,
    },

    [ProductSort.NAME_ASC]: {
      name: 1,
    },

    [ProductSort.NAME_DESC]: {
      name: -1,
    },
  };

  const skip = (page - 1) * limit;

  const [totalProducts, products] = await Promise.all([
    productModel.countDocuments(filter),

    productModel
      .find(filter)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    products,

    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    },
  };
};

export const getAdminProductByIdService = async (
  productId: string
) => {
  const product = await productModel
    .findById(productId)
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
};