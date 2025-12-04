// src/store/useAppStore.js
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

// Vanilla store instance (full state logic)
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

// React hook wrapper
function useAppStore(selector) {
    return useStore(appStoreInstance, selector || ((state) => state));
}

// 🔥 Attach vanilla store API to the hook (just like Zustand defaults)
useAppStore.setState = appStoreInstance.setState;
useAppStore.getState = appStoreInstance.getState;
useAppStore.subscribe = appStoreInstance.subscribe;
useAppStore.destroy = appStoreInstance.destroy;

export default useAppStore;
