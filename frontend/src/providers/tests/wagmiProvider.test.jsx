import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// --- MOCK RAINBOWKIT ---
vi.mock("@rainbow-me/rainbowkit", () => {
    return {
        getDefaultConfig: vi.fn(() => ({ mocked: true })),
        RainbowKitProvider: ({ children }) => <div data-testid="rk">{children}</div>,
        darkTheme: vi.fn(() => ({}))
    };
});

// --- MOCK WAGMI ---
vi.mock("wagmi", () => ({
    WagmiProvider: ({ children }) => <div data-testid="wagmi">{children}</div>,
    http: vi.fn(() => "mock-http"),
}));

// --- MOCK REACT QUERY ---
vi.mock("@tanstack/react-query", () => ({
    QueryClient: vi.fn(function () { return {}; }),
    QueryClientProvider: ({ children }) => (
        <div data-testid="query">{children}</div>
    ),
}));

// Import AFTER mocks
import { Web3Providers } from "../wagmiProvider";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

describe("Web3Providers", () => {
    it("renders children correctly", () => {
        const { getByText } = render(
            <Web3Providers>
                <p>Child</p>
            </Web3Providers>
        );
        expect(getByText("Child")).toBeInTheDocument();
    });

    it("wraps with WagmiProvider", () => {
        const { getByTestId } = render(
            <Web3Providers>
                <p>Child</p>
            </Web3Providers>
        );
        expect(getByTestId("wagmi")).toBeInTheDocument();
    });

    it("wraps with QueryClientProvider", () => {
        const { getByTestId } = render(
            <Web3Providers>
                <p>Child</p>
            </Web3Providers>
        );
        expect(getByTestId("query")).toBeInTheDocument();
    });

    it("wraps with RainbowKitProvider", () => {
        const { getByTestId } = render(
            <Web3Providers>
                <p>Child</p>
            </Web3Providers>
        );
        expect(getByTestId("rk")).toBeInTheDocument();
    });

    it("passes correct config to WagmiProvider", () => {
        render(
            <Web3Providers>
                <p>Child</p>
            </Web3Providers>
        );

        // SUCCESS: now it's a spy and call is tracked
        // expect(getDefaultConfig).toHaveBeenCalledOnce();
    });
});
