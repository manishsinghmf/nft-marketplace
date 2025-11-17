import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { supportedChains } from "../config/chains.js";

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const transports = supportedChains.reduce((acc, chain) => {
    acc[chain.id] = http(); // You can also pass a custom RPC URL here if desired
    return acc;
}, {});

const config = getDefaultConfig({
    appName: "NFT Marketplace DApp",
    projectId,
    chains: supportedChains,
    transports,
    ssr: false,
    autoConnect: false,
});

export function Web3Providers({ children }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    showRecentTransactions
                    theme={darkTheme({ accentColor: "#7c3aed", borderRadius: "medium" })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
