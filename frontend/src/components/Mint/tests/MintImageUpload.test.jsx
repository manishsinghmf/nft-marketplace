import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MintImageUpload from "../MintImageUpload";

describe("MintImageUpload Component — FULL COVERAGE", () => {

    it("shows default text when no image is selected", () => {
        render(<MintImageUpload image={null} onChange={() => { }} error={null} />);

        expect(screen.getByText("Choose Image")).toBeInTheDocument();
    });

    it("displays selected image name", () => {
        const mockImage = new File(["hello"], "test-image.png", { type: "image/png" });

        render(<MintImageUpload image={mockImage} onChange={() => { }} error={null} />);

        expect(screen.getByText("test-image.png")).toBeInTheDocument();
    });

    it("calls onChange with the selected file", () => {
        const mockOnChange = vi.fn();
        const mockFile = new File(["abc"], "photo.jpg", { type: "image/jpg" });

        render(<MintImageUpload image={null} onChange={mockOnChange} error={null} />);

        // Directly select file input — guaranteed to exist
        const fileInput = document.querySelector("input[type='file']");

        fireEvent.change(fileInput, {
            target: { files: [mockFile] },
        });

        expect(mockOnChange).toHaveBeenCalledWith(mockFile);
    });

    it("shows error text", () => {
        render(
            <MintImageUpload
                image={null}
                onChange={() => { }}
                error="Image is required"
            />
        );

        expect(screen.getByText("Image is required")).toBeInTheDocument();
    });
});
