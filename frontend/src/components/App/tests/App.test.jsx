// ------------------------------------------------------
// SAFE HOISTED MOCK VARIABLES (Vitest requirement)
// ------------------------------------------------------
const {
    useModalStoreMock,
    mockSetNetworkModalOpen,
    mockSetNftContract,
    mockSetMarketplaceContract,
    mockSetChainConfig,
    mockUseWallet
} = vi.hoisted(() => ({
    useModalStoreMock: vi.fn(),
    mockSetNetworkModalOpen: vi.fn(),

    mockSetNftContract: vi.fn(),
    mockSetMarketplaceContract: vi.fn(),
    mockSetChainConfig: vi.fn(),

    mockUseWallet: vi.fn(() => ({
        chainId: null,
        isConnected: false,
        activeChain: null,
    })),
}));

// ------------------------------------------------------
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";

// ------------------------------------------------------
// Component under test — dynamically imported inside tests
// ------------------------------------------------------
let App; // filled later with dynamic import()

// ------------------------------------------------------
// Fixed mocks — these load safely because variables exist
// ------------------------------------------------------
vi.mock("../../Header/Header", () => ({
    default: () => <div data-testid="mock-header" />,
}));

vi.mock("../../Footer/Footer", () => ({
    default: () => <div data-testid="mock-footer" />,
}));

vi.mock("../../Modal/Modal", () => ({
    default: () => <div data-testid="mock-global-modal" />,
}));

vi.mock("../../NetworkModal/NetworkModal", () => ({
    default: () => <div data-testid="mock-network-modal" />,
}));

vi.mock("../../../utils/networkUtils", () => ({
    getSupportedNetworkList: vi.fn(() => [{ id: 1, name: "MockNet" }]),
}));

vi.mock("../../../store/modalStore", () => ({
    useModalStore: useModalStoreMock,
}));

vi.mock("../../../store/useAppStore", () => ({
    default: () => ({
        setNftContract: mockSetNftContract,
        setMarketplaceContract: mockSetMarketplaceContract,
        setChainConfig: mockSetChainConfig,
        chainConfig: null,
    }),
}));

vi.mock("../../../hooks/useWallet", () => ({
    default: mockUseWallet,
}));

// Mock viem.getContract
const mockGetContract = vi.fn(() => ({}));
vi.mock("viem", () => ({
    getContract: mockGetContract,
}));

// ------------------------------------------------------
// Helper to re-import App with fresh mocks
// ------------------------------------------------------
async function loadApp() {
    await vi.resetModules(); // Important!
    mockGetContract.mockClear();

    const mod = await import("../App.jsx");
    App = mod.default;
}

// ------------------------------------------------------
// Render helper
// ------------------------------------------------------
const renderApp = () =>
    render(
        <Router>
            <App />
        </Router>
    );

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("App Component — FULL COVERAGE", () => {

    beforeEach(async () => {
        await loadApp();

        useModalStoreMock.mockReturnValue({
            networkModalOpen: false,
            setNetworkModalOpen: mockSetNetworkModalOpen,
        });
    });

    // --------------------------------------------------
    it("renders header, footer, modal, and layout", () => {
        renderApp();

        expect(screen.getByTestId("mock-header")).toBeInTheDocument();
        expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
        expect(screen.getByTestId("mock-global-modal")).toBeInTheDocument();

        expect(screen.getByRole("main")).toHaveClass("min-h-[calc(100vh-164px)]");
    });

    // --------------------------------------------------
    it("hides NetworkModal when networkModalOpen = false", () => {
        renderApp();
        expect(screen.queryByTestId("mock-network-modal")).not.toBeInTheDocument();
    });

    // --------------------------------------------------
    it("shows NetworkModal when networkModalOpen = true", async () => {
        useModalStoreMock.mockReturnValue({
            networkModalOpen: true,
            setNetworkModalOpen: mockSetNetworkModalOpen,
        });

        await loadApp();
        renderApp();

        expect(screen.getByTestId("mock-network-modal")).toBeInTheDocument();
    });

    // --------------------------------------------------
    it("updates chainConfig when wallet connects", async () => {
        mockUseWallet.mockReturnValue({
            isConnected: true,
            chainId: 1,
            activeChain: {
                id: 1,
                name: "MockChain",
                nativeCurrency: { symbol: "ETH" },
                blockExplorers: { default: { url: "https://mockscan.com" } },
            },
        });

        await loadApp();
        renderApp();

        await waitFor(() => {
            expect(mockSetChainConfig).toHaveBeenCalledTimes(1);
        });
    });

    // --------------------------------------------------
    it("initializes contracts when chainConfig exists", async () => {
        mockUseWallet.mockReturnValue({
            isConnected: true,
            chainId: 1,
            activeChain: {
                id: 1,
                name: "MockChain",
                nativeCurrency: { symbol: "ETH" },
                blockExplorers: { default: { url: "https://mockscan.com" } },
            },
        });

        // useAppStore should return a non-null chainConfig
        vi.mock("../../../store/useAppStore", () => ({
            default: () => ({
                setNftContract: mockSetNftContract,
                setMarketplaceContract: mockSetMarketplaceContract,
                setChainConfig: mockSetChainConfig,
                chainConfig: {
                    nftAddress: "0xNFT",
                    marketplaceAddress: "0xMARKET",
                },
            }),
        }));

        await loadApp();
        renderApp();

        await waitFor(() => {
            expect(mockGetContract).toHaveBeenCalledTimes(2);
            expect(mockSetNftContract).toHaveBeenCalled();
            expect(mockSetMarketplaceContract).toHaveBeenCalled();
        });
    });

    // --------------------------------------------------
    it("handles contract initialization failure gracefully", async () => {
        mockUseWallet.mockReturnValue({
            isConnected: true,
            chainId: 1,
            activeChain: {
                id: 1,
                name: "MockChain",
                nativeCurrency: { symbol: "ETH" },
                blockExplorers: { default: { url: "https://mockscan.com" } },
            },
        });

        // make getContract throw
        mockGetContract.mockImplementation(() => {
            throw new Error("bad ABI");
        });

        vi.mock("../../../store/useAppStore", () => ({
            default: () => ({
                setNftContract: mockSetNftContract,
                setMarketplaceContract: mockSetMarketplaceContract,
                setChainConfig: mockSetChainConfig,
                chainConfig: {
                    nftAddress: "0xNFT",
                    marketplaceAddress: "0xMARKET",
                },
            }),
        }));

        await loadApp();
        renderApp();

        // Should NOT crash — so we only assert that set* were NOT called
        await waitFor(() => {
            expect(mockSetNftContract).not.toHaveBeenCalled();
            expect(mockSetMarketplaceContract).not.toHaveBeenCalled();
        });
    });
});
