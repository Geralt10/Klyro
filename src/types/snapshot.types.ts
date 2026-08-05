import { Types } from "mongoose";

export interface ProductSnapshot {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  name: string;
  brand: string;
  image: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  discountPercentage: number;
  finalPrice: number;
}

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
}

export interface PricingSnapshot {
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  grandTotal: number;
}
