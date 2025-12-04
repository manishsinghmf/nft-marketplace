import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react-dom/test-utils";

// MUST mock before importing the component
vi.mock("wagmi", () => ({
    useAccount: vi.fn(),
    usePublicClient: vi.fn(),
}));

vi.mock("../../../config/contracts", () => ({
    CONTRACTS: {
        1: { name: "ETH" },
    },
}));

// Zustand mock
const modalMock = {
    openModal: vi.fn(),
    closeModal: vi.fn(),
    setModal: vi.fn(),
};
vi.mock("../../../store/modalStore", () => ({
    useModalStore: (fn) => fn(modalMock),
}));

// Services mock
vi.mock("../../../services/contractService", () => ({
    ContractService: {
        getListingPrice: vi.fn(),
        fetchAndResolveNFTs: vi.fn(),
    },
}));

import Sell from "../Sell";
import { useAccount, usePublicClient } from "wagmi";
import { ContractService } from "../../../services/contractService";
import { useModalStore } from "../../../store/modalStore";

vi.mock("wagmi", () => ({
    useAccount: vi.fn(),
    usePublicClient: vi.fn(),
}));

// Mock child components (very lightweight)
vi.mock("../../NFTCard/NFTCard", () => ({
    default: (props) => (
        <div data-testid="nft-card" onClick={() => props.onMore(props.nft)}>
            NFT {props.nft?.nftId}
            <button onClick={() => props.onCta(props.nft)}>Sell</button>
        </div>
    ),
}));

vi.mock("../../Detail/Detail", () => ({
    default: () => <div data-testid="detail-modal">DETAIL MODAL</div>,
}));

vi.mock("../../PriceModal/PriceModal", () => ({
    default: () => <div data-testid="price-modal">PRICE MODAL</div>,
}));

vi.mock("../../NoItem/NoItem", () => ({
    default: (p) => <div data-testid="no-item">{p.heading}</div>,
}));

// ────────────────────────────────────────────
// Helper stubs
// ────────────────────────────────────────────
const mockAccount = (connected, addr = "0x123", chainId = 1) => {
    useAccount.mockReturnValue({
        isConnected: connected,
        address: addr,
        chainId,
    });
};

const mockPublicClient = () => {
    usePublicClient.mockReturnValue({});
};

// ────────────────────────────────────────────
// TEST SUITE
// ────────────────────────────────────────────
describe("Sell.jsx (Optimized)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers(); // SUPER SPEED BOOST
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders connect wallet message when disconnected", () => {
        mockAccount(false);
        mockPublicClient();

        render(<Sell />);

        expect(
            screen.getByText("Connect your wallet to list NFTs for sale.")
        ).toBeInTheDocument();
    });

    it("loads listing fee", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockResolvedValue("1000000000000000000");
        ContractService.fetchAndResolveNFTs.mockResolvedValue([]);

        render(<Sell />);

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(screen.getByText(/1 ETH/)).toBeInTheDocument();
    });

    it("falls back to 0 ETH on listing fee error", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockRejectedValue(new Error("fail"));
        ContractService.fetchAndResolveNFTs.mockResolvedValue([]);

        render(<Sell />);

        await vi.runAllTimersAsync();

        expect(screen.getByText(/0 ETH/)).toBeInTheDocument();
    });

    it("shows NFT cards when NFTs exist", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockResolvedValue("0");
        ContractService.fetchAndResolveNFTs.mockResolvedValue([
            { nftId: 1 },
            { nftId: 2 },
        ]);

        render(<Sell />);

        await vi.runAllTimersAsync();

        const cards = screen.getAllByTestId("nft-card");
        expect(cards.length).toBe(2);
    });

    it("renders NoItem when no NFTs found", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockResolvedValue("0");
        ContractService.fetchAndResolveNFTs.mockResolvedValue([]);

        render(<Sell />);

        await vi.runAllTimersAsync();

        expect(screen.getByTestId("no-item")).toBeInTheDocument();
    });

    it("opens detail modal when NFT is clicked", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockResolvedValue("0");
        ContractService.fetchAndResolveNFTs.mockResolvedValue([{ nftId: 1 }]);

        render(<Sell />);

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        fireEvent.click(screen.getByTestId("nft-card"));

        expect(screen.getByTestId("detail-modal")).toBeInTheDocument();
    });


    it("opens price modal when Sell button clicked", async () => {
        mockAccount(true);
        mockPublicClient();

        ContractService.getListingPrice.mockResolvedValue("0");
        ContractService.fetchAndResolveNFTs.mockResolvedValue([{ nftId: 1 }]);

        render(<Sell />);

        await vi.runAllTimersAsync();

        fireEvent.click(screen.getByText("Sell"));

        expect(screen.getByTestId("price-modal")).toBeInTheDocument();
    });
});
