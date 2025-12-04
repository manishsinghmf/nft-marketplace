import React from "react";
import { z } from "zod";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MintForm from "../MintForm";

// -------------------------------------
// ✅ Vitest-compatible component mocks
//   Must return { default: Component }
// -------------------------------------

vi.mock("../MintImageUpload", () => ({
    default: ({ onChange, image, error }) => (
        <div data-testid="mock-image-upload">
            <button
                data-testid="upload-btn"
                onClick={() =>
                    onChange(
                        new File(["dummy content"], "test.png", { type: "image/png" })
                    )
                }
            >
                Upload Image
            </button>
            {error && <span data-testid="image-error">{error}</span>}
        </div>
    ),
}));

vi.mock("../MintAttributes", () => ({
    default: ({ register }) => (
        <div data-testid="mock-attributes-grid">
            {/* simplified mock: a single attribute field */}
            <input {...register("quantity")} data-testid="quantity-input" />
        </div>
    ),
}));

// -------------------------------------
// ✅ Validation Schema Mock
// -------------------------------------

vi.mock("../../../utils/mintFormValidation", () => {
    return {
        mintSchema: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            quantity: z.number().optional(),
            rarity: z.number().optional(),
            image: z.any().optional()
        })
    };
});


// -------------------------------------
// TEST SUITE
// -------------------------------------
describe("MintForm Component", () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
    });

    const renderComponent = () => render(<MintForm onSubmit={mockOnSubmit} />);

    // -------------------------------------
    it("renders all required form elements", () => {
        renderComponent();

        expect(screen.getByTestId("mock-image-upload")).toBeInTheDocument();
        expect(screen.getByTestId("mock-attributes-grid")).toBeInTheDocument();

        expect(screen.getByPlaceholderText("NFT Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("NFT Description")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /mint nft/i })
        ).toBeInTheDocument();
    });

    // -------------------------------------
    it("calls onSubmit with correct form data", async () => {
        renderComponent();

        const nameInput = screen.getByPlaceholderText("NFT Name");
        const descInput = screen.getByPlaceholderText("NFT Description");
        const submitButton = screen.getByRole("button", { name: /mint nft/i });

        await userEvent.type(nameInput, "Test NFT Name");
        await userEvent.type(descInput, "A brief description.");

        // Submit form
        fireEvent.submit(submitButton);

        await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

        expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Test NFT Name",
                description: "A brief description.",
                quantity: 1, // RHF default
                rarity: 1,   // RHF default
                image: null, // default before upload
            }),
            expect.anything()
        );
    });
});
