import { PipelineStage, QueryFilter } from "mongoose";
import { GetProductsQuery } from "../getProductsQuerySchema.js";
import { IProduct } from "../product.interface.js";
import { ProductSort, ProductStatus } from "../product.enums.js";
import { productModel } from "../product.model.js";
import { ApiError } from "../../../utils/ApiError.js";

export const getBuyerProductsService = async (
  query: GetProductsQuery
) => {
  const {
    page,
    limit,
    search,
    category,
    gender,
    brand,
    color,
    size,
    minPrice,
    maxPrice,
    sort,
  } = query;

  const pipeline: PipelineStage[] = [];

  const match: QueryFilter<IProduct> = {
    status: ProductStatus.ACTIVE,
  };

  if (search) {
    match.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (category) {
    match.category = category;
  }

  if (gender) {
    match.gender = gender;
  }

  if (brand) {
    match.brand = {
      $regex: brand,
      $options: "i",
    };
  }

  if (color) {
    match.color = {
      $regex: color,
      $options: "i",
    };
  }

  if (size) {
    match.inventory = {
      $elemMatch: {
        size,
        stock: {
          $gt: 0,
        },
      },
    };
  }

  pipeline.push({
    $match: match,
  });

  pipeline.push({
    $addFields: {
      finalPrice: {
        $subtract: [
          "$basePrice",
          {
            $multiply: [
              "$basePrice",
              {
                $divide: [
                  "$discountPercentage",
                  100,
                ],
              },
            ],
          },
        ],
      },
    },
  });

  if (
    minPrice !== undefined ||
    maxPrice !== undefined
  ) {
    const priceFilter: Record<
      string,
      number
    > = {};

    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }

    pipeline.push({
      $match: {
        finalPrice: priceFilter,
      },
    });
  }

  const sortMap: Record<
    ProductSort,
    Record<string, 1 | -1>
  > = {
    [ProductSort.NEWEST]: {
      createdAt: -1,
    },

    [ProductSort.OLDEST]: {
      createdAt: 1,
    },

    [ProductSort.PRICE_ASC]: {
      finalPrice: 1,
    },

    [ProductSort.PRICE_DESC]: {
      finalPrice: -1,
    },

    [ProductSort.NAME_ASC]: {
      name: 1,
    },

    [ProductSort.NAME_DESC]: {
      name: -1,
    },
  };

  pipeline.push({
    $sort: sortMap[sort],
  });

  const skip = (page - 1) * limit;

  pipeline.push({
    $facet: {
      products: [
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],

      pagination: [
        {
          $count: "totalProducts",
        },
      ],
    },
  });

  const [result] = await productModel.aggregate(pipeline);

  const products = result?.products ?? [];

  const totalProducts =
    result.pagination[0]?.totalProducts ?? 0;

  return {
    products,

    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(
        totalProducts / limit
      ),
    },
  };
};

export const getBuyerProductByIdService = async (
  productId: string
) => {
  const product = await productModel
    .findOne({
      _id: productId,
      status: ProductStatus.ACTIVE,
    })
    .select("-seller")
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
};