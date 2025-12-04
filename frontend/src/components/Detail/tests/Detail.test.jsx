import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Detail from "../Detail";

// Create a mock portal root before tests run
beforeEach(() => {
    const portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(portalRoot);
});

afterEach(() => {
    document.body.innerHTML = "";
});

const mockNFT = {
    nftId: 101,
    name: "Dragon Artifact",
    description: "A legendary NFT.",
    image: "https://example.com/image.png",
    price: 5,
    amount: 2,
    uri: "https://metadata.example.com/101",
    attributes: [
        { trait_type: "rarity", value: "legendary" },
        { trait_type: "power", value: 9000 },
    ],
};

describe("Detail Component", () => {
    it("returns null if nft_data is missing", () => {
        const { container } = render(<Detail nft_data={null} setshowDetail={() => { }} />);
        expect(container.firstChild).toBeNull();
    });

    it("returns null if modal-root is missing", () => {
        document.body.innerHTML = ""; // remove modal-root
        const { container } = render(<Detail nft_data={mockNFT} setshowDetail={() => { }} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders NFT metadata inside a portal", () => {
        render(<Detail nft_data={mockNFT} setshowDetail={() => { }} />);

        const portalRoot = document.getElementById("modal-root");
        expect(portalRoot).toBeTruthy();

        // heading
        expect(screen.getByText("NFT Metadata Details")).toBeInTheDocument();

        // basic fields
        expect(screen.getByText("TOKEN ID :")).toBeInTheDocument();
        expect(screen.getByText("Dragon Artifact")).toBeInTheDocument();
        expect(screen.getByText("A legendary NFT.")).toBeInTheDocument();

        // price
        const priceRow = screen.getByText(/PRICE/i).closest("div");
        expect(priceRow).toHaveTextContent("5");

        // quantity
        const qtyRow = screen.getByText(/QUANTITY/i).closest("div");
        expect(qtyRow).toHaveTextContent("2");

        // attributes (avoid duplicate 'legendary' error)
        const rarityRow = screen.getByText(/RARITY/i).closest("div");
        expect(rarityRow).toHaveTextContent("legendary");

        const powerRow = screen.getByText(/POWER/i).closest("div");
        expect(powerRow).toHaveTextContent("9000");

        // metadata URL
        expect(screen.getByText(mockNFT.uri)).toBeInTheDocument();
    });

    it("calls setshowDetail(false) when close button is clicked", () => {
        const mockClose = vi.fn();

        render(<Detail nft_data={mockNFT} setshowDetail={mockClose} />);

        fireEvent.click(screen.getByText("Close"));

        expect(mockClose).toHaveBeenCalledTimes(1);
        expect(mockClose).toHaveBeenCalledWith(false);
    });

    it("closes when clicking the background overlay", () => {
        const mockClose = vi.fn();

        render(<Detail nft_data={mockNFT} setshowDetail={mockClose} />);

        const bg = document.querySelector(".overlay-bg");
        fireEvent.click(bg);

        expect(mockClose).toHaveBeenCalledTimes(1);
        expect(mockClose).toHaveBeenCalledWith(false);
    });

    it("renders the image when provided", () => {
        render(<Detail nft_data={mockNFT} setshowDetail={() => { }} />);

        const img = screen.getByAltText(mockNFT.name);
        expect(img).toBeInTheDocument();
        expect(img.src).toBe(mockNFT.image);
    });
});
