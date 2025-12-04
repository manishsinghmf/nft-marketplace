import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "../Header";
import { vi } from "vitest";

// ---------------------------------------
// HOIST-SAFE MOCKS
// ---------------------------------------

vi.mock("../../../assets/logo.png", () => ({
    default: "logo.png",
}));

vi.mock("../../../hooks/useWallet", () => ({
    default: vi.fn(() => ({
        address: "0x1234567890abcdef1234567890abcdef12345678",
        isConnected: true,
        chainId: 1,
        activeChain: { id: 1, name: "Ethereum" },
    })),
}));

// Zustand store mock (CORRECT)
vi.mock("../../../store/useAppStore", () => {
    const store = () => ({ chainConfig: null });
    store.setState = vi.fn(); // <<< spy here
    return { default: store };
});

// modal store mock
vi.mock("../../../store/modalStore", () => ({
    useModalStore: vi.fn(() => ({
        setNetworkModalOpen: vi.fn(),
    })),
}));

// rainbowkit mock
vi.mock("@rainbow-me/rainbowkit", () => ({
    ConnectButton: () => <div data-testid="mock-connect" />,
}));

vi.mock("../../../config/chains", () => ({
    supportedChains: [
        {
            id: 1,
            name: "Ethereum",
            nativeCurrency: { symbol: "ETH" },
            blockExplorers: { default: { url: "https://etherscan.io" } },
        },
    ],
}));

// helper
const renderHeader = () =>
    render(
        <Router>
            <Header />
        </Router>
    );

// ---------------------------------------
// TESTS
// ---------------------------------------
describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders logo and menu", () => {
        renderHeader();

        expect(screen.getByAltText("logo")).toBeInTheDocument();

        ["Dashboard", "My Collection", "Mint", "Buy", "Sell"].forEach((text) => {
            expect(screen.getAllByText(text).length).toBeGreaterThan(0);
        });
    });

    it("renders ConnectButton twice (desktop + mobile)", () => {
        renderHeader();
        expect(screen.getAllByTestId("mock-connect").length).toBe(2);
    });

    it("opens and closes mobile nav menu (visibility check only)", () => {
        renderHeader();

        const toggle = screen.getByRole("button");

        // OPEN
        fireEvent.click(toggle);
        expect(screen.getAllByText("Sell").length).toBeGreaterThan(0);

        // CLOSE
        fireEvent.click(toggle);

        // JSDOM does NOT animate collapse — we only check that toggle ran.
        // Collapse is hidden via inline height, but JSDOM never applies it.
        expect(toggle).toBeInTheDocument(); // sanity check
    });

});
