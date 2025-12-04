import { formatError } from "../formatError";

describe("formatError", () => {

    test("returns user-friendly message for user-denied error", () => {
        const err = new Error("User denied transaction");
        expect(formatError(err)).toBe("User rejected the transaction.");
    });

    test("returns insufficient funds message", () => {
        const err = new Error("insufficient funds for gas");
        expect(formatError(err)).toBe("You don't have enough balance.");
    });

    test("returns execution reverted message", () => {
        const err = new Error("execution reverted: failed");
        expect(formatError(err)).toBe("Transaction failed on blockchain.");
    });

    test("returns gas limit message", () => {
        const err = new Error("gas required exceeds allowance");
        expect(formatError(err)).toBe("Gas limit too low.");
    });

    test("strips technical junk from message", () => {
        const err = new Error("Something bad happened. Request Arguments: {data...}");
        expect(formatError(err)).toBe("Something bad happened.");
    });

    test("returns default message for null input", () => {
        expect(formatError(null)).toBe("Unexpected error");
    });

    test("returns generic error as string", () => {
        expect(formatError("simple error")).toBe("simple error");
    });

});
