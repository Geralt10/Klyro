import { z } from "zod";

const storeNameRegex = /^[a-z0-9][a-z0-9\s_-]*$/;

const businessAddressSchema = z.object({
    addressLine1: z
      .string({
        error: "Address line 1 must be a string.",
      })
      .trim()
      .min(5, "Address line 1 must be at least 5 characters.")
      .max(200, "Address line 1 cannot exceed 200 characters."),

    addressLine2: z
      .string({
        error: "Address line 2 must be a string.",
      })
      .trim()
      .min(1, "Address line 2 cannot be empty.")
      .max(200, "Address line 2 cannot exceed 200 characters.")
      .optional(),

    city: z
      .string({
        error: "City must be a string.",
      })
      .trim()
      .min(2, "City must be at least 2 characters.")
      .max(100, "City cannot exceed 100 characters."),

    state: z
      .string({
        error: "State must be a string.",
      })
      .trim()
      .min(2, "State must be at least 2 characters.")
      .max(100, "State cannot exceed 100 characters."),

    country: z
      .string({
        error: "Country must be a string.",
      })
      .trim()
      .min(2, "Country must be at least 2 characters.")
      .max(100, "Country cannot exceed 100 characters."),

    postalCode: z
      .string({
        error: "Postal code must be a string.",
      })
      .trim()
      .min(3, "Postal code must be at least 3 characters.")
      .max(20, "Postal code cannot exceed 20 characters."),
  }).strict();

  export const createSellerSchema = z.object({
    storeName: z
      .string({
        error: "Store name must be a string.",
      })
      .trim()
      .toLowerCase()
      .min(3, "Store name must be at least 3 characters.")
      .max(100, "Store name cannot exceed 100 characters.")
      .regex(
        storeNameRegex,
        "Store name can only contain lowercase letters, numbers, spaces, hyphens and underscores."
      ),

    businessName: z
      .string({
        error: "Business name must be a string.",
      })
      .trim()
      .min(3, "Business name must be at least 3 characters.")
      .max(150, "Business name cannot exceed 150 characters."),

    description: z
      .string({
        error: "Description must be a string.",
      })
      .trim()
      .min(1, "Description cannot be empty.")
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    businessAddress: businessAddressSchema,
  }).strict();

  export const updateSellerSchema = createSellerSchema
  .partial()
  .extend({
    businessAddress: businessAddressSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update.",
    }
  );


export type CreateSellerInput = z.infer<typeof createSellerSchema>;

export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;