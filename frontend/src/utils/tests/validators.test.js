// src/components/Mint/tests/validators.mint.test.js
import { validateMintData } from "../validators";

describe("validateMintData()", () => {

    const validInfo = {
        name: "Test NFT",
        description: "Desc",
        quantity: 1,
        rarity: 1,
        style: 1,
        beauty: 1,
        comedy: 1,
        action: 1,
    };

    /* -------------------------------------------------------
     * IMAGE VALIDATION
     * ----------------------------------------------------- */
    test("fails when image is missing", () => {
        const result = validateMintData(validInfo, null);

        expect(result).toEqual({
            valid: false,
            heading: "Missing Image",
            message: "Upload an image.",
        });
    });

    /* -------------------------------------------------------
     * NAME / DESCRIPTION
     * ----------------------------------------------------- */
    test("fails when name or description is missing", () => {
        const badInfo = { ...validInfo, name: "" };

        const result = validateMintData(badInfo, "image.png");

        expect(result).toEqual({
            valid: false,
            heading: "Missing Fields",
            message: "Name & description required.",
        });
    });

    /* -------------------------------------------------------
     * NUMERIC VALIDATION: non-number
     * ----------------------------------------------------- */
    test("fails when numeric field contains invalid number", () => {
        const badInfo = { ...validInfo, quantity: "abc" };

        const result = validateMintData(badInfo, "image.png");

        expect(result).toEqual({
            valid: false,
            heading: "Invalid Input",
            message: "quantity must be a valid number",
        });
    });

    /* -------------------------------------------------------
     * NUMERIC VALIDATION: <= 0
     * ----------------------------------------------------- */
    test("fails when numeric field <= 0", () => {
        const badInfo = { ...validInfo, rarity: 0 };

        const result = validateMintData(badInfo, "image.png");

        expect(result).toEqual({
            valid: false,
            heading: "Invalid Input",
            message: "rarity must be > 0",
        });
    });

    /* -------------------------------------------------------
     * SUCCESS
     * ----------------------------------------------------- */
    test("passes for valid input & image", () => {
        const result = validateMintData(validInfo, "img.png");

        expect(result.valid).toBe(true);
    });
});
