import { SortOrder, Types, QueryFilter} from "mongoose";
import { CreateProductInput } from "../product.validation.js";
import { IImage } from "../../../shared/schemas/image.schema.js";
import { sellerModel } from "../../seller/seller.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { deleteImages, uploadImages } from "../../../services/image.service.js";
import { generateUniqueSlug } from "../../../utils/slug.js";
import { productModel } from "../product.model.js";
import { GetSellerProductsQuery } from "../getSellerProductsQuerySchema.js";
import { IProduct } from "../product.interface.js";
import { ProductSort } from "../product.enums.js";




export const createProductService = async (
  userId: string,
  data: CreateProductInput,
  files: Express.Multer.File[]
) => {
  if (!files || files.length < 3) {
    throw new ApiError(400, "At least 3 product images are required.");
  }
  let uploadedImages: IImage[] = [];
  if (typeof data.inventory === "string") {
    data.inventory = JSON.parse(data.inventory);
  }

  try {
    const seller = await sellerModel.findOne({ userId });

    if (!seller) {
      throw new ApiError(404, "Seller profile not found.");
    }

    
    const existingProduct = await productModel.findOne({
      seller: seller._id,
      name: data.name.trim(),
    });

    if (existingProduct) {
      throw new ApiError(409, "Product with this name already exists.");
    }

    uploadedImages = await uploadImages(files, "products");

    const slug = await generateUniqueSlug(
      data.name,
      async (slug) => !!(await productModel.exists({ slug }))
    );

    const product = await productModel.create({
      ...data,
      seller: seller._id,
      slug,
      images: uploadedImages,
    });

    return product;
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteImages(uploadedImages.map((image) => image.fileId));
    }

    throw error;
  }
};


export const getSellerProductsService = async (
  userId: string,
  query: GetSellerProductsQuery
) => {
  const seller = await sellerModel.findOne({ userId });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const {
    page,
    limit,
    search,
    category,
    status,
    sort,
  } = query;

  const filter: QueryFilter<IProduct> = {
    seller: seller._id,
  };

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

  const sortOption = sortMap[sort];

  const skip = (page - 1) * limit;

  const [totalProducts, products] = await Promise.all([
    productModel.countDocuments(filter),

    productModel
      .find(filter)
      .sort(sortOption)
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



export const getSellerProductByIdService = async (
  userId: string,
  productId: Types.ObjectId
) => {
  const seller = await sellerModel.findOne({ userId });

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const product = await productModel.findOne({
    _id: productId,
    seller: seller._id,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
};