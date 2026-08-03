import { SortOrder, Types, QueryFilter} from "mongoose";
import { CreateProductInput, UpdateProductInput } from "../product.validation.js";
import { IImage } from "../../../shared/schemas/image.schema.js";
import { sellerModel } from "../../seller/seller.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { deleteImages, uploadImages } from "../../../services/image.service.js";
import { generateUniqueSlug } from "../../../utils/slug.js";
import { productModel } from "../product.model.js";
import { GetSellerProductsQuery } from "../getSellerProductsQuerySchema.js";
import { IProduct } from "../product.interface.js";
import { ProductSort } from "../product.enums.js";
import { logger } from "../../../config/logger.js";




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



export const updateProductService = async (
  userId: string,
  productId: Types.ObjectId,
  data: UpdateProductInput,
  files: Express.Multer.File[]
) => {
  let uploadedImages: IImage[] = [];

  try {
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

    const hasUpdates =
      Object.keys(data).some((key) => {
        if (key === "deletedImageIds") {
          return (data.deletedImageIds?.length ?? 0) > 0;
        }

        return true;
      }) || files.length > 0;

    if (!hasUpdates) {
      throw new ApiError(400, "Nothing to update.");
    }

    let slug = product.slug;

    if (data.name && data.name !== product.name) {
      const existingProduct = await productModel.exists({
        seller: seller._id,
        name: data.name,
        _id: {
          $ne: product._id,
        },
      });

      if (existingProduct) {
        throw new ApiError(
          409,
          "Product with this name already exists."
        );
      }

      slug = await generateUniqueSlug(
        data.name,
        async (slug) =>
          !!(
            await productModel.exists({
              slug,
              _id: {
                $ne: product._id,
              },
            })
          )
      );
    }

    if (files.length > 0) {
      uploadedImages = await uploadImages(
        files,
        "products"
      );
    }

    const deletedImageIds = data.deletedImageIds ?? [];

    const remainingImages = product.images.filter(
      (image) => !deletedImageIds.includes(image.fileId)
    );

    const updatedImages = [
      ...remainingImages,
      ...uploadedImages,
    ];

    if (updatedImages.length < 3) {
      throw new ApiError(
        400,
        "Product must contain at least 3 image."
      );
    }

    const {
      deletedImageIds: _deletedImageIds,
      ...updateData
    } = data;

    Object.assign(product, {
      ...updateData,
      slug,
      images: updatedImages,
    });

    await product.save();

    if (deletedImageIds.length > 0) {
      try {
        await deleteImages(deletedImageIds);
      } catch (error) {
        logger.error(
          {
            productId: product._id,
            deletedImageIds,
            error,
          },
          "Failed to delete product images from ImageKit."
        );
      }
    }

    return product;
  } catch (error) {
    if (uploadedImages.length > 0) {
      try {
        await deleteImages(
          uploadedImages.map(
            (image) => image.fileId
          )
        );
      } catch (rollbackError) {
        logger.error(
          {
            uploadedImages,
            rollbackError,
          },
          "Failed to rollback uploaded images."
        );
      }
    }

    throw error;
  }
};