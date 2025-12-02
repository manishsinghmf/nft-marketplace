// import { render, screen, fireEvent } from "@testing-library/react";
// import MintForm from "../MintForm";
// import { ALLOWED_IMAGE_FORMATS } from "../../../utils/commonUtils";

// describe("MintForm Component", () => {
//     let nftInfo, setNftInfo, nftImage, setNftImage, imageName, setImageName;

//     beforeEach(() => {
//         nftInfo = {
//             name: "",
//             description: "",
//             quantity: "",
//             rarity: "",
//             style: "",
//             beauty: "",
//             comedy: "",
//             action: "",
//         };

//         setNftInfo = jest.fn((fn) => {
//             nftInfo = fn(nftInfo);
//         });

//         nftImage = null;
//         setNftImage = jest.fn((v) => (nftImage = v));

//         imageName = "";
//         setImageName = jest.fn((v) => (imageName = v));
//     });

//     function setup() {
//         return render(
//             <MintForm
//                 nftInfo={nftInfo}
//                 setNftInfo={setNftInfo}
//                 nftImage={nftImage}
//                 setNftImage={setNftImage}
//                 imageName={imageName}
//                 setImageName={setImageName}
//             />
//         );
//     }

//     // -----------------------------------------------------
//     // IMAGE UPLOAD TESTS
//     // -----------------------------------------------------
//     test("accepts valid image formats", () => {
//         setup();

//         const fileInput = screen.getByLabelText(/choose image/i);

//         const validFile = new File(["dummy"], "test.png", { type: "image/png" });

//         fireEvent.change(fileInput, { target: { files: [validFile] } });

//         expect(setNftImage).toHaveBeenCalledWith(validFile);
//         expect(setImageName).toHaveBeenCalledWith("test.png");
//     });

//     test("rejects invalid image formats", () => {
//         setup();

//         const fileInput = screen.getByLabelText(/choose image/i);

//         const invalidFile = new File(["dummy"], "badfile.txt", { type: "text/plain" });

//         fireEvent.change(fileInput, { target: { files: [invalidFile] } });

//         expect(setNftImage).not.toHaveBeenCalled();
//         expect(setImageName).not.toHaveBeenCalled();
//     });

//     // -----------------------------------------------------
//     // TEXT INPUT TESTS
//     // -----------------------------------------------------
//     test("updates name field", () => {
//         setup();
//         const nameInput = screen.getByPlaceholderText("NFT Name");

//         fireEvent.change(nameInput, { target: { value: "My NFT" } });

//         expect(setNftInfo).toHaveBeenCalled();
//         expect(nftInfo.name).toBe("My NFT");
//     });

//     test("updates description field", () => {
//         setup();
//         const descInput = screen.getByPlaceholderText("NFT Description");

//         fireEvent.change(descInput, { target: { value: "Cool NFT" } });

//         expect(setNftInfo).toHaveBeenCalled();
//         expect(nftInfo.description).toBe("Cool NFT");
//     });

//     // -----------------------------------------------------
//     // NUMBER INPUT TESTS
//     // -----------------------------------------------------
//     test("accepts numeric input", () => {
//         setup();
//         const qtyInput = screen.getByLabelText("Quantity").parentElement.querySelector("input");

//         fireEvent.change(qtyInput, { target: { name: "quantity", value: "5" } });

//         expect(setNftInfo).toHaveBeenCalled();
//         expect(nftInfo.quantity).toBe(5);
//     });

//     test("clears numeric input when empty", () => {
//         setup();
//         const qtyInput = screen.getByLabelText("Quantity").parentElement.querySelector("input");

//         fireEvent.change(qtyInput, { target: { name: "quantity", value: "" } });

//         expect(setNftInfo).toHaveBeenCalled();
//         expect(nftInfo.quantity).toBe("");
//     });

//     test("rejects non-numeric input", () => {
//         setup();
//         const rarityInput = screen.getByLabelText("Rarity").parentElement.querySelector("input");

//         fireEvent.change(rarityInput, { target: { name: "rarity", value: "abc" } });

//         // setter should NOT be called because "abc" is invalid
//         expect(setNftInfo).not.toHaveBeenCalled();
//     });
// });


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MintForm from '../MintForm';

// Mock child components
jest.mock('../MintImageUpload', () => ({ onChange, image, error }) => (
    <div data-testid="mock-image-upload">
        <button onClick={() => onChange(new File(['dummy content'], 'test.png', { type: 'image/png' }))}>Upload Image</button>
        {error && <span data-testid="image-error">{error}</span>}
    </div>
));
jest.mock('../MintAttributes', () => ({ register, errors }) => (
    <div data-testid="mock-attributes-grid">
        {/* Simplified mock to show one attribute input */}
        <input {...register("quantity")} data-testid="quantity-input" />
    </div>
));

// Mock validation schema if needed for specific validation error testing
// If zodSchema is simple, rely on RHF's integration, otherwise mock:
jest.mock('../../../utils/mintFormValidation', () => ({
    mintSchema: {
        // Mock schema that just allows basic inputs to pass for component testing
        parse: (data) => data,
    }
}));


describe('MintForm Component', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        // Clear mock calls before each test
        mockOnSubmit.mockClear();
    });

    const renderComponent = () => render(<MintForm onSubmit={mockOnSubmit} />);

    it('renders all required form elements', () => {
        renderComponent();

        // Check for child components
        expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument();
        expect(screen.getByTestId('mock-attributes-grid')).toBeInTheDocument();

        // Check for inputs/textarea
        expect(screen.getByPlaceholderText('NFT Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('NFT Description')).toBeInTheDocument();

        // Check for submit button
        expect(screen.getByRole('button', { name: /mint nft/i })).toBeInTheDocument();
    });

    it('calls onSubmit with form data when form is filled and submitted correctly', async () => {
        renderComponent();

        const nameInput = screen.getByPlaceholderText('NFT Name');
        const descriptionTextarea = screen.getByPlaceholderText('NFT Description');
        const submitButton = screen.getByRole('button', { name: /mint nft/i });

        // Simulate user input
        userEvent.type(nameInput, 'Test NFT Name');
        userEvent.type(descriptionTextarea, 'A brief description.');

        // Use fireEvent for form submission
        fireEvent.submit(submitButton);

        // Wait for the onSubmit handler to be called (it's asynchronous via RHF)
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        });

        // Check the structure of the data passed to the onSubmit handler
        expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test NFT Name',
                description: 'A brief description.',
                // Default values are also included
                quantity: 1,
                rarity: 1,
                image: null,
            }),
            expect.anything() // form event object
        );
    });
});
