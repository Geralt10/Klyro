import { Types } from "mongoose";
import { CreateProductInput } from "../product.validation.js";
import { IImage } from "../../../shared/schemas/image.schema.js";
import { sellerModel } from "../../seller/seller.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { deleteImages, uploadImages } from "../../../services/image.service.js";
import { generateUniqueSlug } from "../../../utils/slug.js";
import { productModel } from "../product.model.js";




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


