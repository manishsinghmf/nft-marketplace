// src/components/Mint/validators.mint.js

/**
 * Pure validation logic for Mint form.
 * Returns:
 *   { valid: true }
 * or {
 *   valid: false,
 *   heading: "...",
 *   message: "..."
 * }
 */
export function validateMintData(nftInfo, nftImage) {
    if (!nftImage) {
        return {
            valid: false,
            heading: "Missing Image",
            message: "Upload an image.",
        };
    }

    if (!nftInfo.name || !nftInfo.description) {
        return {
            valid: false,
            heading: "Missing Fields",
            message: "Name & description required.",
        };
    }

    const numeric = ["quantity", "rarity", "style", "beauty", "comedy", "action"];

    for (const key of numeric) {
        const value = nftInfo[key];

        if (value === "" || value === null || isNaN(Number(value))) {
            return {
                valid: false,
                heading: "Invalid Input",
                message: `${key} must be a valid number`,
            };
        }

        if (Number(value) <= 0) {
            return {
                valid: false,
                heading: "Invalid Input",
                message: `${key} must be > 0`,
            };
        }
    }

    return { valid: true };
}
