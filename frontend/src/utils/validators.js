import { ALERT, ATTRIBUTES_NUMERIC_VALUE_ERROR } from "../utils/messageConstants";

/**
 * Validates mint form data.
 */
export function validateMintForm(nftInfo, openModal) {
    for (const [key, value] of Object.entries(nftInfo)) {
        if (!value || value === "") {
            openModal({
                heading: ALERT,
                description: "All fields are required.",
                loading: true,
            });
            return false;
        }

        if (key === "quantity") {
            if (!(value > 0 && value <= 100)) {
                openModal({
                    heading: ALERT,
                    description: ATTRIBUTES_NUMERIC_VALUE_ERROR,
                    loading: true,
                });
                return false;
            }
        }

        if (!["name", "description", "quantity"].includes(key)) {
            if (!(value > 0 && value <= 10)) {
                openModal({
                    heading: ALERT,
                    description: ATTRIBUTES_NUMERIC_VALUE_ERROR,
                    loading: true,
                });
                return false;
            }
        }
    }

    return true;
}
