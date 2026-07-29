import { randomUUID } from "crypto";

import { imagekit } from "../config/imageKit.js";
import { logger } from "../config/logger.js";
import { IImage } from "../shared/schemas/image.schema.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadImage = async (
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<IImage> => {
  try {
    const sanitizedFileName = fileName
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const extension = sanitizedFileName.includes(".")
      ? sanitizedFileName.substring(sanitizedFileName.lastIndexOf("."))
      : "";

    const uniqueFileName = `${randomUUID()}${extension}`;

    const response = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder,
    });

    return {
      url: response.url,
      fileId: response.fileId,
    };
  } catch (error) {
    logger.error(
      {
        err: error,
        fileName,
        folder,
      },
      "Failed to upload image."
    );

    throw new ApiError(500, "Failed to upload image.");
  }
};

export const deleteImage = async (
  fileId: string
): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    logger.error(
      {
        err: error,
        fileId,
      },
      "Failed to delete image."
    );

    throw new ApiError(500, "Failed to delete image.");
  }
};


export const uploadImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<IImage[]> => {
  return Promise.all(
    files.map((file) =>
      uploadImage(
        file.buffer,
        file.originalname,
        folder
      )
    )
  );
};

export const deleteImages = async (
  fileIds: string[]
): Promise<void> => {
  await Promise.all(fileIds.map((fileId) => deleteImage(fileId)));
};

