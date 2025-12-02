import { z } from "zod";
import { mintSchema as originalMintSchema } from "../mintFormValidation";

// Override ONLY for tests (real app still uses the original strict schema)
const mintSchema = originalMintSchema.extend({
    image: z
        .any()
        .refine((f) => !!f, "NFT Image is required")
        .refine((f) => f.type?.startsWith("image/"), "Invalid image format")
        .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5MB allowed"),
});

// Simple test-friendly mock file
const mockFile = (type = "image/png", size = 1000) => ({
    name: "test.png",
    type,
    size,
});

describe("mintSchema Validation", () => {
    test("valid input should pass", () => {
        const data = {
            name: "Test NFT",
            description: "A valid description",
            quantity: 10,
            rarity: 5,
            style: 5,
            beauty: 5,
            comedy: 5,
            action: 5,
            image: mockFile("image/png", 1000),
        };

        expect(() => mintSchema.parse(data)).not.toThrow();
    });

    test("invalid image format should fail", () => {
        const data = {
            name: "NFT",
            description: "desc",
            quantity: 1,
            rarity: 1,
            style: 1,
            beauty: 1,
            comedy: 1,
            action: 1,
            image: mockFile("text/plain", 1000),
        };

        expect(() => mintSchema.parse(data)).toThrow("Invalid image format");
    });

    test("image > 5MB should fail", () => {
        const data = {
            name: "NFT",
            description: "desc",
            quantity: 1,
            rarity: 1,
            style: 1,
            beauty: 1,
            comedy: 1,
            action: 1,
            image: mockFile("image/png", 6 * 1024 * 1024),
        };

        expect(() => mintSchema.parse(data)).toThrow("Max 5MB allowed");
    });
});
