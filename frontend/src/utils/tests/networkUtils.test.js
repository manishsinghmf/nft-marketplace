import { getSupportedNetworkList, getChainDisplayName } from "../networkUtils";

// Mock the supportedChains import
vi.mock("../../config/chains", () => ({
    supportedChains: [
        {
            id: 1,
            name: "Ethereum",
            nativeCurrency: { symbol: "ETH" },
            blockExplorers: { default: { url: "https://etherscan.io" } },
        },
        {
            id: 137,
            name: "Polygon",
            nativeCurrency: { symbol: "MATIC" },
            blockExplorers: { default: { url: "https://polygonscan.com" } },
        },
        {
            id: 80001,
            name: "Mumbai",
            nativeCurrency: { symbol: "MATIC" },
            blockExplorers: null, // simulate missing explorer
        },
    ],
}));

describe("getSupportedNetworkList", () => {
    test("formats supported chains correctly", () => {
        const networks = getSupportedNetworkList();

        expect(networks).toHaveLength(3);

        expect(networks[0]).toEqual({
            id: 1,
            name: "Ethereum",
            symbol: "ETH",
            explorer: "https://etherscan.io",
        });

        expect(networks[1]).toEqual({
            id: 137,
            name: "Polygon",
            symbol: "MATIC",
            explorer: "https://polygonscan.com",
        });
    });

    test("handles missing explorer", () => {
        const networks = getSupportedNetworkList();
        expect(networks[2].explorer).toBe("");
    });
});

describe("getChainDisplayName", () => {
    test("returns correct name for known chain", () => {
        expect(getChainDisplayName(1)).toBe("Ethereum");
        expect(getChainDisplayName("137")).toBe("Polygon"); // string -> number
    });

    test("returns fallback for unknown chain", () => {
        expect(getChainDisplayName(99999)).toBe("Unknown chain (99999)");
    });
});
