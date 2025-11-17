// src/store/useAppStore.js
import { create } from "zustand";

const useAppStore = create((set) => ({
    // 🔗 Wallet + network state
    walletConnected: null,
    walletEthBalance: "0",
    isChainSupported: false,
    chainConfig: null,
    networkSelected: null,
    isNetworkModalOpen: false,

    // 🧩 Contract instances
    nftContract: null,
    marketplaceContract: null,

    // ⚙️ Setters
    setWalletConnected: (val) => set({ walletConnected: val }),
    setWalletEthBalance: (val) => set({ walletEthBalance: val }),
    setIsChainSupported: (val) => set({ isChainSupported: val }),
    setChainConfig: (val) => set({ chainConfig: val }),
    setNetworkSelected: (val) => set({ networkSelected: val }),
    setIsNetworkModalOpen: (val) => set({ isNetworkModalOpen: val }),

    // ✅ Contract setters
    setNftContract: (contract) => set({ nftContract: contract }),
    setMarketplaceContract: (contract) => set({ marketplaceContract: contract }),
}));

export default useAppStore;
