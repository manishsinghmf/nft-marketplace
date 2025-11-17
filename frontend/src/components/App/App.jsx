// src/components/App/App.jsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import GlobalModal from "../common/GlobalModal";
import NetworkModal from "../NetworkModal/NetworkModal";

import { getSupportedNetworkList } from "../../utils/networkUtils";

import useAppStore from "../../store/useAppStore";
import useWallet from "../../hooks/useWallet";
import { useModalStore } from "../../store/modalStore";

import { getContract } from "viem";
import { nftAbi } from "../../config/abis/fandomNftAbi";
import { marketplaceAbi } from "../../config/abis/marketplaceAbi";

export default function App() {
    /** UI: network modal store */
    const { networkModalOpen, setNetworkModalOpen } = useModalStore();
    const networkList = getSupportedNetworkList();

    /** App global contract / chain config store */
    const {
        setNftContract,
        setMarketplaceContract,
        setChainConfig,
        chainConfig
    } = useAppStore();

    /** Wallet / network hook */
    const { chainId, isConnected, activeChain } = useWallet();

    /**
     * ⚙️ When wallet switches chains → update chainConfig
     */
    useEffect(() => {
        if (!isConnected || !activeChain) return;

        setChainConfig({
            id: activeChain.id,
            name: activeChain.name,
            currency: activeChain.nativeCurrency.symbol,
            explorerUrl: activeChain.blockExplorers?.default?.url || "",
            nftAddress: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            marketplaceAddress: import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS,
        });
    }, [isConnected, activeChain, setChainConfig]);

    /**
     * 🧩 Build contract instances when chainConfig changes
     */
    useEffect(() => {
        if (!chainConfig || !isConnected || !activeChain) return;

        try {
            const nftContract = getContract({
                address: chainConfig.nftAddress,
                abi: nftAbi,
                client: { chain: activeChain },
            });

            const marketplaceContract = getContract({
                address: chainConfig.marketplaceAddress,
                abi: marketplaceAbi,
                client: { chain: activeChain },
            });

            setNftContract(nftContract);
            setMarketplaceContract(marketplaceContract);

        } catch (err) {
            console.error("❌ Contract initialization failed:", err);
        }
    }, [chainConfig, isConnected, activeChain, setNftContract, setMarketplaceContract]);

    return (
        <>
            {/* APP LAYOUT */}
            <div className="flex flex-col min-h-screen bg-[#121212] text-white">
                <Header />

                <main className="flex-1 min-h-[calc(100vh-164px)] bg-[#1e1e1e]">
                    <Outlet />
                </main>

                <Footer />
            </div>

            {/* GLOBAL MODAL (ZUSTAND) */}
            <GlobalModal />

            {/* NETWORK SWITCH MODAL */}
            {networkModalOpen && (
                <NetworkModal
                    data={networkList}
                    setIsNetworkModalOpen={setNetworkModalOpen}
                />
            )}
        </>
    );
}
