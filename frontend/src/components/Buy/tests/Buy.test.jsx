/**
 * IMPORTANT: All mocks BEFORE importing component
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ───────────────────────
// MOCK wagmi BEFORE import
// ───────────────────────
const mockAccount = vi.fn();
const mockPublicClient = vi.fn();
const mockWalletClient = vi.fn();

vi.mock("wagmi", () => ({
    useAccount: () => mockAccount(),
    usePublicClient: () => mockPublicClient(),
    useWalletClient: () => ({ data: mockWalletClient() }),
}));

// ───────────────────────
// MOCK Zustand
// ───────────────────────
const modalMock = {
    openModal: vi.fn(),
    setModal: vi.fn(),
    closeModal: vi.fn(),
};

vi.mock("../../../store/modalStore", () => ({
    useModalStore: (fn) => fn(modalMock),
}));

// ───────────────────────
// MOCK services
// ───────────────────────
vi.mock("../../../services/contractService", () => ({
    ContractService: {
        fetchAndResolveNFTs: vi.fn(),
        buyMarketItem: vi.fn(),
    },
}));

vi.mock("../../../services/gasService", () => ({
    estimateTotalGasCost: vi.fn(),
}));

vi.mock("../../../services/balanceService", () => ({
    BalanceService: { hasEnoughBalance: vi.fn() },
}));

// CONFIG
vi.mock("../../../config/contracts", () => ({
    CONTRACTS: {
        1: { name: "ETH", explorerUrl: "https://etherscan.io/tx/" },
    },
}));

vi.mock("../../../config/contractFunctions", () => ({
    CONTRACT_FUNCTIONS: { MARKETPLACE: { BUY: "buyMarketItem" } },
}));

// MOCK UI components
vi.mock("../../NoItem/NoItem", () => ({
    default: (p) => <div data-testid="no-item">{p.heading}</div>,
}));

vi.mock("../../Detail/Detail", () => ({
    default: () => <div data-testid="detail-popup" />,
}));

vi.mock("../../NFTCard/NFTCard", () => ({
    default: ({ nft, onMore, onCta }) => (
        <div data-testid="nft-card">
            <button onClick={() => onMore(nft)}>MORE</button>
            <button onClick={() => onCta(nft)}>BUY</button>
        </div>
    ),
}));

// ───────────────────────
// IMPORT COMPONENT (after mocks)
// ───────────────────────
import Buy from "../Buy";
import { ContractService } from "../../../services/contractService";
import { estimateTotalGasCost } from "../../../services/gasService";
import { BalanceService } from "../../../services/balanceService";

describe("Buy Component — FIXED", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAccount.mockReturnValue({
            address: "0x111",
            isConnected: true,
            chainId: 1,
        });

        mockPublicClient.mockReturnValue({
            getBalance: vi.fn().mockResolvedValue(10n ** 18n),
            waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 1 }),
        });

        mockWalletClient.mockReturnValue({});
    });

    it("renders NFT list", async () => {
        ContractService.fetchAndResolveNFTs.mockResolvedValue([
            { nftId: 1, name: "NFT A", raw: { seller: "0x222" } },
        ]);

        render(<Buy />);

        expect(await screen.findByTestId("nft-card")).toBeInTheDocument();
    });

    it("opens detail popup", async () => {
        ContractService.fetchAndResolveNFTs.mockResolvedValue([
            { nftId: 1, name: "NFT A", raw: { seller: "0x222" } },
        ]);

        render(<Buy />);

        fireEvent.click(await screen.findByText("MORE"));

        expect(screen.getByTestId("detail-popup")).toBeInTheDocument();
    });

    it("executes BUY flow successfully", async () => {
        ContractService.fetchAndResolveNFTs.mockResolvedValue([
            { nftId: 1, itemId: 9, price: 1, raw: { seller: "0x222" } },
        ]);

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 1n,
            requiredEth: 0.1,
        });

        BalanceService.hasEnoughBalance.mockReturnValue(true);

        ContractService.buyMarketItem.mockResolvedValue({ tx: "0x123" });

        render(<Buy />);

        fireEvent.click(await screen.findByText("BUY"));

        await waitFor(() => {
            expect(ContractService.buyMarketItem).toHaveBeenCalled();
        });
    });
});
