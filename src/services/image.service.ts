import { imagekit } from "../config/imageKit.js";
import { logger } from "../config/logger.js";
import { IImage } from "../shared/schemas/image.schema.js";


export const uploadImage = async (
  file: Buffer,
  fileName: string
): Promise<IImage> => {}

export const deleteImage = async (
  fileId: string
): Promise<void> => {}