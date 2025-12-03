import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NFTCard from "../NFTCard";

/* Helper NFT object */
const baseNFT = {
    nftId: 1,
    name: "Test NFT",
    description: "A great NFT",
    image: "test.png",
    price: 5,
};

describe("NFTCard Component — Full Coverage", () => {
    it("renders NFT basic info", () => {
        render(<NFTCard nft={baseNFT} />);

        expect(screen.getByText("Test NFT")).toBeInTheDocument();
        expect(screen.getByText("A great NFT")).toBeInTheDocument();

        const img = screen.getByRole("img");
        expect(img.src).toContain("test.png");
    });

    it("shows price when showPrice=true", () => {
        render(
            <NFTCard nft={baseNFT} currency="ETH" showPrice={true} />
        );

        expect(screen.getByText(/Price: 5 ETH/)).toBeInTheDocument();
    });

    it("does NOT show price when showPrice=false", () => {
        render(
            <NFTCard nft={baseNFT} currency="ETH" showPrice={false} />
        );

        expect(screen.queryByText(/Price:/)).not.toBeInTheDocument();
    });

    it("renders 'more details' button when showMore=true", () => {
        render(
            <NFTCard nft={baseNFT} showMore={true} onMore={() => { }} />
        );

        expect(screen.getByText(/more details/i)).toBeInTheDocument();
    });

    it("does NOT render 'more details' when showMore=false", () => {
        render(<NFTCard nft={baseNFT} showMore={false} />);

        expect(screen.queryByText(/more details/i)).not.toBeInTheDocument();
    });

    it("calls onMore when clicking 'more details'", () => {
        const onMore = vi.fn();

        render(
            <NFTCard nft={baseNFT} showMore={true} onMore={onMore} />
        );

        fireEvent.click(screen.getByText(/more details/i));

        expect(onMore).toHaveBeenCalledWith(baseNFT);
    });

    it("renders CTA button when ctaText provided", () => {
        render(
            <NFTCard nft={baseNFT} ctaText="Sell" onCta={() => { }} />
        );

        expect(screen.getByText("Sell")).toBeInTheDocument();
    });

    it("calls onCta when CTA button clicked", () => {
        const onCta = vi.fn();

        render(
            <NFTCard nft={baseNFT} ctaText="Sell" onCta={onCta} />
        );

        fireEvent.click(screen.getByText("Sell"));

        expect(onCta).toHaveBeenCalledWith(baseNFT);
    });

    it("handles missing onMore safely (does not crash)", () => {
        render(
            <NFTCard nft={baseNFT} showMore={true} />
        );

        fireEvent.click(screen.getByText(/more details/i));

        // No crash → test passes
        expect(true).toBe(true);
    });

    it("handles missing onCta safely (does not crash)", () => {
        render(
            <NFTCard nft={baseNFT} ctaText="Buy" />
        );

        fireEvent.click(screen.getByText("Buy"));

        // No crash → test passes
        expect(true).toBe(true);
    });

    it("renders with missing NFT fields gracefully", () => {
        const badNFT = {
            nftId: 99,
            name: "",
            description: "",
            image: "",
        };

        render(<NFTCard nft={badNFT} />);

        expect(screen.getByRole("img")).toBeInTheDocument();
    });
});
