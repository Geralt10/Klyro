import { z } from "zod";
import { objectIdSchema } from "../../shared/validations/objectId.validation.js";
import { AddressType } from "./address.enums.js";

const addressBaseSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),

    phone: z.string().trim().regex(/^[6-9]\d{9}$/),

    addressLine1: z.string().trim().min(5).max(200),

    addressLine2: z.string().trim().min(1).max(200).optional(),

    landmark: z.string().trim().min(1).max(200).optional(),

    city: z.string().trim().min(2).max(100),

    state: z.string().trim().min(2).max(100),

    postalCode: z.string().trim().regex(/^\d{6}$/),

    addressType: z.enum(AddressType),
  })
  .strict();

export const createAddressSchema = addressBaseSchema;

export const updateAddressSchema = addressBaseSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update.",
    }
  );

export const addressIdParamsSchema = z
  .object({
    addressId: objectIdSchema,
  })
  .strict();

export type CreateAddressInput = z.infer<
  typeof createAddressSchema
>;

export type UpdateAddressInput = z.infer<
  typeof updateAddressSchema
>;

export type AddressIdParams = z.infer<
  typeof addressIdParamsSchema
>;
