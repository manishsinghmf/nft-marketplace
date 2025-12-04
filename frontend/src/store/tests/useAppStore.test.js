// src/store/tests/useAppStore.test.js
import { appStoreInstance } from "../useAppStore";

// Reset Zustand store before each test
beforeEach(() => {
    appStoreInstance.setState(appStoreInstance.getInitialState());
});

describe("useAppStore", () => {
    test("setWalletConnected", () => {
        const { setWalletConnected } = appStoreInstance.getState();
        setWalletConnected(true);

        expect(appStoreInstance.getState().walletConnected).toBe(true);
    });

    test("setWalletEthBalance", () => {
        const { setWalletEthBalance } = appStoreInstance.getState();
        setWalletEthBalance("10");

        expect(appStoreInstance.getState().walletEthBalance).toBe("10");
    });

    test("setIsChainSupported", () => {
        const { setIsChainSupported } = appStoreInstance.getState();
        setIsChainSupported(true);

        expect(appStoreInstance.getState().isChainSupported).toBe(true);
    });

    test("setChainConfig", () => {
        const { setChainConfig } = appStoreInstance.getState();
        const cfg = { id: 1, name: "TestChain" };

        setChainConfig(cfg);

        expect(appStoreInstance.getState().chainConfig).toEqual(cfg);
    });

    test("setNetworkSelected", () => {
        const { setNetworkSelected } = appStoreInstance.getState();
        setNetworkSelected("sepolia");

        expect(appStoreInstance.getState().networkSelected).toBe("sepolia");
    });

    test("setIsNetworkModalOpen", () => {
        const { setIsNetworkModalOpen } = appStoreInstance.getState();
        setIsNetworkModalOpen(true);

        expect(appStoreInstance.getState().isNetworkModalOpen).toBe(true);
    });

    test("setNftContract", () => {
        const { setNftContract } = appStoreInstance.getState();
        const fake = { contract: "NFT" };

        setNftContract(fake);

        expect(appStoreInstance.getState().nftContract).toBe(fake);
    });

    test("setMarketplaceContract", () => {
        const { setMarketplaceContract } = appStoreInstance.getState();
        const fake = { contract: "Market" };

        setMarketplaceContract(fake);

        expect(appStoreInstance.getState().marketplaceContract).toBe(fake);
    });
});
