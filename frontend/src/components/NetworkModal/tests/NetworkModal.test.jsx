import { render, screen, fireEvent } from "@testing-library/react";
import NetworkModal from "../NetworkModal";
import React from "react";

// ---------------- Mock Zustand store ----------------
vi.mock("../../../store/modalStore", () => {
    return {
        useModalStore: (selector) =>
            selector({
                openModal: mockOpenModal,
            }),
    };
});

let mockOpenModal = vi.fn();

// ---------------- Mock wagmi hooks ----------------
let mockSwitchChain = vi.fn();
let mockIsPending = false;
let mockIsConnected = false;
let mockChainId = 1;

vi.mock("wagmi", () => ({
    useSwitchChain: () => ({
        switchChain: mockSwitchChain,
        isPending: mockIsPending,
    }),
    useAccount: () => ({ isConnected: mockIsConnected }),
    useChainId: () => mockChainId,
}));

// ---------------- Mock supportedChains ----------------
vi.mock("../../../config/chains", () => ({
    supportedChains: [
        { id: 1, name: "Ethereum" },
        { id: 137, name: "Polygon" },
    ],
}));

// ---------------- Helper renderer ----------------
let mockClose = vi.fn();

const renderModal = () =>
    render(<NetworkModal setIsNetworkModalOpen={mockClose} />);

beforeEach(() => {
    mockOpenModal = vi.fn();
    mockSwitchChain = vi.fn();
    mockClose = vi.fn();

    mockIsConnected = false;
    mockIsPending = false;
    mockChainId = 1;

    vi.clearAllMocks();
});

describe("NetworkModal Component", () => {
    it("renders the supported networks", () => {
        renderModal();

        expect(screen.getByText("Ethereum (Active)")).toBeInTheDocument();
        expect(screen.getByText("Polygon")).toBeInTheDocument();
    });

    it("closes when background is clicked", () => {
        renderModal();

        const bg = document.querySelector(".network-darkBG");
        expect(bg).toBeInTheDocument();

        fireEvent.click(bg);
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("shows modal error when user is NOT connected", () => {
        mockIsConnected = false;

        renderModal();

        fireEvent.click(screen.getByText("Polygon"));

        expect(mockOpenModal).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Wallet Not Connected",
                description: "Please connect your wallet first.",
            })
        );

        expect(mockClose).toHaveBeenCalled();
    });

    it("calls switchChain when user is connected", () => {
        mockIsConnected = true;

        renderModal();

        fireEvent.click(screen.getByText("Polygon"));

        expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 137 });
        expect(mockClose).toHaveBeenCalled();
    });

    it("handles switchChain error", () => {
        mockIsConnected = true;

        // Suppress console.error output
        const spy = vi.spyOn(console, "error").mockImplementation(() => { });

        mockSwitchChain = vi.fn(() => {
            throw new Error("Chain switch failed");
        });

        renderModal();

        fireEvent.click(screen.getByText("Polygon"));

        expect(mockOpenModal).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Network Switch Failed",
                description: "Chain switch failed",
            })
        );

        expect(mockClose).toHaveBeenCalled();
        spy.mockRestore();
    });

    it("shows 'Switching network...' when isPending is true", () => {
        mockIsConnected = true;
        mockIsPending = true;

        renderModal();

        expect(screen.getByText("Switching network...")).toBeInTheDocument();
    });
});
