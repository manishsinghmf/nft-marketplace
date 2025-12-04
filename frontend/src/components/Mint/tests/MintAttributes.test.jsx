import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MintAttributes from "../MintAttributes";

describe("MintAttributes Component — FULL COVERAGE", () => {

    const mockRegister = vi.fn().mockReturnValue({}); // react-hook-form binder
    const mockErrors = {};

    it("renders all fields with correct labels", () => {
        render(<MintAttributes register={mockRegister} errors={{}} />);

        const labels = [
            "Quantity",
            "Rarity",
            "Style",
            "Beauty",
            "Comedy",
            "Action",
        ];

        labels.forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });

        // All 6 input pairs exist
        expect(screen.getAllByRole("spinbutton").length).toBe(6);
    });

    it("register is called for every field", () => {
        render(<MintAttributes register={mockRegister} errors={mockErrors} />);

        expect(mockRegister).toHaveBeenCalledTimes(6);

        const expectedKeys = ["quantity", "rarity", "style", "beauty", "comedy", "action"];

        expectedKeys.forEach((key) => {
            expect(mockRegister).toHaveBeenCalledWith(key, { valueAsNumber: true });
        });
    });

    it("displays correct max values", () => {
        render(<MintAttributes register={mockRegister} errors={{}} />);

        const maxInputs = screen.getAllByDisplayValue(/10|100/);

        // quantity = 100, the rest = 10 → total 6 disabled max inputs
        expect(maxInputs.length).toBe(6);

        expect(screen.getByDisplayValue("100")).toBeInTheDocument(); // quantity max
        expect(screen.getAllByDisplayValue("10").length).toBe(5);    // others max
    });

    it("shows validation error messages", () => {
        const errors = {
            rarity: { message: "Rarity must be between 1 and 10" },
        };

        render(<MintAttributes register={mockRegister} errors={errors} />);

        expect(screen.getByText("Rarity must be between 1 and 10")).toBeInTheDocument();
    });
});
