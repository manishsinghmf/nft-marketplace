// src/store/useAppStore.js
import { createStore } from "zustand/vanilla";

export const appStoreInstance = createStore((set) => ({
    walletConnected: null,
    walletEthBalance: "0",
    isChainSupported: false,
    chainConfig: null,
    networkSelected: null,
    isNetworkModalOpen: false,

    nftContract: null,
    marketplaceContract: null,

    setWalletConnected: (v) => set({ walletConnected: v }),
    setWalletEthBalance: (v) => set({ walletEthBalance: v }),
    setIsChainSupported: (v) => set({ isChainSupported: v }),
    setChainConfig: (config) => set({ chainConfig: config }),
    setNetworkSelected: (v) => set({ networkSelected: v }),
    setIsNetworkModalOpen: (v) => set({ isNetworkModalOpen: v }),

    setNftContract: (c) => set({ nftContract: c }),
    setMarketplaceContract: (c) => set({ marketplaceContract: c }),
}));

export default appStoreInstance;
