/**
 * ALL mocks must come before importing Mint.jsx
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

/* ------------------------------------------------------
    MOCK wagmi hooks
------------------------------------------------------ */
const useAccountMock = vi.fn();
const useBalanceMock = vi.fn();
const usePublicClientMock = vi.fn();
const useWalletClientMock = vi.fn();

vi.mock("wagmi", () => ({
    useAccount: () => useAccountMock(),
    useBalance: (...args) => useBalanceMock(...args),
    usePublicClient: () => usePublicClientMock(),
    useWalletClient: () => useWalletClientMock(),
}));

/* ------------------------------------------------------
    MOCK useMintTx
------------------------------------------------------ */
const mintMock = vi.fn();

vi.mock("../../../hooks/useMintTx", () => ({
    default: () => ({
        mint: mintMock,
    }),
}));

/* ------------------------------------------------------
    MOCK MintForm
------------------------------------------------------ */
vi.mock("../MintForm", () => ({
    default: ({ onSubmit }) => (
        <div>
            <button data-testid="mint-submit" onClick={() => onSubmit({ some: "data" })}>
                Submit Mint
            </button>
        </div>
    ),
}));

/* ------------------------------------------------------
    MOCK CONTRACT CONFIG
------------------------------------------------------ */
vi.mock("../../../config/contracts", () => ({
    CONTRACTS: {
        1: { name: "ETH" },
    },
}));

/* ------------------------------------------------------
    Import Component AFTER mocks
------------------------------------------------------ */
import Mint from "../Mint";

/* ------------------------------------------------------
    Test utility wrapper
------------------------------------------------------ */
const renderMint = () =>
    render(
        <BrowserRouter>
            <Mint />
        </BrowserRouter>
    );

/* ------------------------------------------------------
    RESET before each test
------------------------------------------------------ */
beforeEach(() => {
    useAccountMock.mockReset().mockReturnValue({ isConnected: false });

    usePublicClientMock.mockReset().mockReturnValue({});
    useWalletClientMock
        .mockReset()
        .mockReturnValue({ data: {} });   // ← FIX
    useBalanceMock
        .mockReset()
        .mockReturnValue({ data: {} });   // ← FIX

    mintMock.mockReset();
});

/* ------------------------------------------------------
    TEST SUITE
------------------------------------------------------ */
describe("Mint Component — Full Coverage", () => {

    it("renders connect wallet message when not connected", () => {
        useAccountMock.mockReturnValue({ isConnected: false });

        renderMint();

        expect(
            screen.getByText(/Please connect your wallet to mint NFT/i)
        ).toBeInTheDocument();
    });

    it("renders unsupported network message", () => {
        useAccountMock.mockReturnValue({ isConnected: true, chainId: 999 });

        usePublicClientMock.mockReturnValue({});
        useWalletClientMock.mockReturnValue({ data: {} });
        useBalanceMock.mockReturnValue({ data: {} });

        renderMint();

        expect(
            screen.getByText(/Unsupported network/i)
        ).toBeInTheDocument();
    });

    it("renders MintForm when connected & network supported", () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            address: "0xabc",
            chainId: 1,
        });

        usePublicClientMock.mockReturnValue({});
        useWalletClientMock.mockReturnValue({ data: {} });
        useBalanceMock.mockReturnValue({ data: {} });

        renderMint();

        expect(screen.getByTestId("mint-submit")).toBeInTheDocument();
    });

    it("passes mint fn to MintForm & triggers mint on submit", () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            address: "0xabc",
            chainId: 1,
        });

        usePublicClientMock.mockReturnValue({});
        useWalletClientMock.mockReturnValue({ data: {} });
        useBalanceMock.mockReturnValue({ data: {} });

        renderMint();

        fireEvent.click(screen.getByTestId("mint-submit"));

        expect(mintMock).toHaveBeenCalledWith({ some: "data" });
    });

    it("renders even if walletClient or balanceData is undefined", () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            address: "0xabc",
            chainId: 1,
        });

        usePublicClientMock.mockReturnValue({});
        useWalletClientMock.mockReturnValue({ data: undefined });
        useBalanceMock.mockReturnValue({ data: undefined });

        renderMint();

        expect(screen.getByTestId("mint-submit")).toBeInTheDocument();
    });
});
