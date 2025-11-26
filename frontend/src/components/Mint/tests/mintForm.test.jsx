import { render, screen, fireEvent } from "@testing-library/react";
import MintForm from "../MintForm";
import { ALLOWED_IMAGE_FORMATS } from "../../../utils/commonUtils";

describe("MintForm Component", () => {
    let nftInfo, setNftInfo, nftImage, setNftImage, imageName, setImageName;

    beforeEach(() => {
        nftInfo = {
            name: "",
            description: "",
            quantity: "",
            rarity: "",
            style: "",
            beauty: "",
            comedy: "",
            action: "",
        };

        setNftInfo = jest.fn((fn) => {
            nftInfo = fn(nftInfo);
        });

        nftImage = null;
        setNftImage = jest.fn((v) => (nftImage = v));

        imageName = "";
        setImageName = jest.fn((v) => (imageName = v));
    });

    function setup() {
        return render(
            <MintForm
                nftInfo={nftInfo}
                setNftInfo={setNftInfo}
                nftImage={nftImage}
                setNftImage={setNftImage}
                imageName={imageName}
                setImageName={setImageName}
            />
        );
    }

    // -----------------------------------------------------
    // IMAGE UPLOAD TESTS
    // -----------------------------------------------------
    test("accepts valid image formats", () => {
        setup();

        const fileInput = screen.getByLabelText(/choose image/i);

        const validFile = new File(["dummy"], "test.png", { type: "image/png" });

        fireEvent.change(fileInput, { target: { files: [validFile] } });

        expect(setNftImage).toHaveBeenCalledWith(validFile);
        expect(setImageName).toHaveBeenCalledWith("test.png");
    });

    test("rejects invalid image formats", () => {
        setup();

        const fileInput = screen.getByLabelText(/choose image/i);

        const invalidFile = new File(["dummy"], "badfile.txt", { type: "text/plain" });

        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        expect(setNftImage).not.toHaveBeenCalled();
        expect(setImageName).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------
    // TEXT INPUT TESTS
    // -----------------------------------------------------
    test("updates name field", () => {
        setup();
        const nameInput = screen.getByPlaceholderText("NFT Name");

        fireEvent.change(nameInput, { target: { value: "My NFT" } });

        expect(setNftInfo).toHaveBeenCalled();
        expect(nftInfo.name).toBe("My NFT");
    });

    test("updates description field", () => {
        setup();
        const descInput = screen.getByPlaceholderText("NFT Description");

        fireEvent.change(descInput, { target: { value: "Cool NFT" } });

        expect(setNftInfo).toHaveBeenCalled();
        expect(nftInfo.description).toBe("Cool NFT");
    });

    // -----------------------------------------------------
    // NUMBER INPUT TESTS
    // -----------------------------------------------------
    test("accepts numeric input", () => {
        setup();
        const qtyInput = screen.getByLabelText("Quantity").parentElement.querySelector("input");

        fireEvent.change(qtyInput, { target: { name: "quantity", value: "5" } });

        expect(setNftInfo).toHaveBeenCalled();
        expect(nftInfo.quantity).toBe(5);
    });

    test("clears numeric input when empty", () => {
        setup();
        const qtyInput = screen.getByLabelText("Quantity").parentElement.querySelector("input");

        fireEvent.change(qtyInput, { target: { name: "quantity", value: "" } });

        expect(setNftInfo).toHaveBeenCalled();
        expect(nftInfo.quantity).toBe("");
    });

    test("rejects non-numeric input", () => {
        setup();
        const rarityInput = screen.getByLabelText("Rarity").parentElement.querySelector("input");

        fireEvent.change(rarityInput, { target: { name: "rarity", value: "abc" } });

        // setter should NOT be called because "abc" is invalid
        expect(setNftInfo).not.toHaveBeenCalled();
    });
});
