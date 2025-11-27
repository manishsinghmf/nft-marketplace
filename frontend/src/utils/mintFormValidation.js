import { z } from "zod";

export const mintSchema = z.object({
    name: z.string().min(1, "NFT name is required").max(50),
    description: z.string().min(1, "NFT Description is required").max(500),

    quantity: z.number().min(1).max(100),
    rarity: z.number().min(1).max(10),
    style: z.number().min(1).max(10),
    beauty: z.number().min(1).max(10),
    comedy: z.number().min(1).max(10),
    action: z.number().min(1).max(10),

    image: z
        .instanceof(File, { message: "NFT Image is required" })
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "Max 5MB allowed",
        })
        .refine((file) => file.type.startsWith("image/"), {
            message: "Invalid image format",
        }),
});
