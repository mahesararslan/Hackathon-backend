import { z } from 'zod';

export const signupSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const sellFormSchema = z.object({
    deviceType: z.enum(["smartphone", "laptop", "tablet"]),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "Model is required" }),
    yearOfPurchase: z.number().min(1900).max(new Date().getFullYear()),
    condition: z.enum(["new", "used", "damaged"]),
    storageCapacity: z.string().min(1, { message: "Storage capacity is required" }),
    defects: z.array(z.string()),
    serialNumber: z.string().min(1, { message: "Serial number or IMEI is required" }).optional(),
    images: z.array(z.any()).min(1, { message: "At least one image is required" }),
    estimatedPrice: z.number().min(1),
    deliveryMethod: z.enum(["pickup", "parcel"]),
  });

  export const adjustPriceSchema = z.object({
    deviceId: z.string(),
    newPrice: z.number().min(1),
  });