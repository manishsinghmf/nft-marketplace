/**
 * src/components/MyCollection/tests/MyCollection.test.jsx
 *
 * Tests for MyCollection component.
 *
 * IMPORTANT:
 * - All vi.mock calls must come BEFORE importing the component under test.
 * - Use relative paths (no aliases) so Vite resolves modules correctly.
 */

import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

/* ---------------------------
   Mocks — must be before import of the component
   (Paths are relative to this test file)
   --------------------------- */

/* Mock wagmi hooks */
let useAccountMock = vi.fn();
let usePublicClientMock = vi.fn();

vi.mock("wagmi", () => ({
    useAccount: () => useAccountMock(),
    usePublicClient: () => usePublicClientMock(),
}));

/* Mock Zustand modal store (paths relative to test file) */
let openModalMock, setModalMock, closeModalMock;

vi.mock("../../../store/modalStore", () => ({
    useModalStore: (selector) =>
        selector({
            openModal: (...args) => openModalMock(...args),
            setModal: (...args) => setModalMock(...args),
            closeModal: (...args) => closeModalMock(...args),
            modalData: {},
            isOpen: false,
        }),
}));

/* Mock ContractService
   NOTE: path here is relative to this test file:
   test: src/components/MyCollection/tests/MyCollection.test.jsx
   service: src/services/contractService.js  -> "../../../services/contractService"
*/
vi.mock("../../../services/contractService", () => ({
    ContractService: {
        fetchAndResolveNFTs: vi.fn(),
    },
}));

/* Mock contracts config (so CONTRACTS[chainId] works) */
vi.mock("../../../config/contracts", () => ({
    CONTRACTS: {
        1: { name: "ETH" },
    },
}));

/* Mock formatError util to avoid dependency on implementation */
vi.mock("../../../utils/formatError", () => ({
    formatError: (err) => `Formatted: ${err?.message || "err"}`,
}));

/* Mock child components used by MyCollection */
vi.mock("../../Detail/Detail", () => ({
    default: ({ nft_data }) => <div data-testid="detail-modal">Detail-{nft_data?.nftId}</div>,
}));

vi.mock("../../NoItem/NoItem", () => ({
    default: ({ heading }) => <div data-testid="noitem">{heading}</div>,
}));

vi.mock("../../NFTCard/NFTCard", () => ({
    default: ({ nft, onCta }) => (
        <div data-testid={`nft-${nft.nftId}`}>
            <button data-testid={`cta-${nft.nftId}`} onClick={() => onCta(nft)}>
                Details
            </button>
        </div>
    ),
}));

/* ---------------------------
   Now import the component under test (after mocks)
   --------------------------- */
import MyCollection from "../MyCollection";

/* Pull in the mocked ContractService to control its behavior in tests */
import { ContractService } from "../../../services/contractService";

/* ---------------------------
   Tests setup / teardown
   --------------------------- */

/* Temporarily silence console.error to keep test output clean (optional) */
let _origConsoleError;
beforeEach(() => {
    _origConsoleError = console.error;
    console.error = () => { };
});
afterEach(() => {
    console.error = _origConsoleError;
});

beforeEach(() => {
    openModalMock = vi.fn();
    setModalMock = vi.fn();
    closeModalMock = vi.fn();

    useAccountMock.mockReset();
    usePublicClientMock.mockReset();

    ContractService.fetchAndResolveNFTs.mockReset();
});

/* small helper to render the component */
const renderMyCollection = () => render(<MyCollection />);

/* ---------------------------
   Test cases
   --------------------------- */
describe("MyCollection component", () => {
    it("shows connect wallet message when not connected", () => {
        useAccountMock.mockReturnValue({ isConnected: false });

        renderMyCollection();

        expect(
            screen.getByText(/Please connect your wallet to view your collection/i)
        ).toBeInTheDocument();
    });

    it("loads owned and listed NFTs and displays them", async () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            chainId: 1,
            address: "0xabc",
        });
        usePublicClientMock.mockReturnValue({});

        // First call returns owned NFTs, second call returns listed NFTs
        ContractService.fetchAndResolveNFTs
            .mockResolvedValueOnce([{ nftId: 101 }, { nftId: 102 }]) // owned
            .mockResolvedValueOnce([{ nftId: 201 }]); // listed

        renderMyCollection();

        // The component should call openModal when loading begins
        expect(openModalMock).toHaveBeenCalledWith(
            "Loading...",
            "Fetching NFTs...",
            true,
            "loader"
        );

        // Wait for at least one owned item to appear (ensures effect finished)
        await waitFor(() => screen.getByTestId("nft-101"));

        expect(screen.getByTestId("nft-101")).toBeInTheDocument();
        expect(screen.getByTestId("nft-102")).toBeInTheDocument();
        expect(screen.getByTestId("nft-201")).toBeInTheDocument();

        // And the loader should be closed after success
        expect(closeModalMock).toHaveBeenCalledWith("loader");
    });

    it("handles fetch failure and shows error modal", async () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            chainId: 1,
            address: "0xabc",
        });
        usePublicClientMock.mockReturnValue({});

        // Simulate failure for the first fetch (owned); component catches and calls setModal
        ContractService.fetchAndResolveNFTs.mockRejectedValue(new Error("boom"));

        renderMyCollection();

        await waitFor(() => expect(setModalMock).toHaveBeenCalled());

        expect(setModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Error",
                description: expect.any(String),
                loading: false,
            })
        );
    });

    it("renders NoItem when there are no owned/listed NFTs", async () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            chainId: 1,
            address: "0xabc",
        });
        usePublicClientMock.mockReturnValue({});

        ContractService.fetchAndResolveNFTs.mockResolvedValueOnce([]); // owned
        ContractService.fetchAndResolveNFTs.mockResolvedValueOnce([]); // listed

        renderMyCollection();

        await waitFor(() => screen.getByTestId("noitem"));

        expect(screen.getByTestId("noitem")).toHaveTextContent("No NFTs Found");
    });

    it("opens Detail modal when NFT CTA is clicked", async () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
            chainId: 1,
            address: "0xabc",
        });
        usePublicClientMock.mockReturnValue({});

        ContractService.fetchAndResolveNFTs
            .mockResolvedValueOnce([{ nftId: 333 }]) // owned
            .mockResolvedValueOnce([]); // listed

        renderMyCollection();

        await waitFor(() => screen.getByTestId("cta-333"));

        fireEvent.click(screen.getByTestId("cta-333"));

        expect(screen.getByTestId("detail-modal")).toHaveTextContent("333");
    });
});
