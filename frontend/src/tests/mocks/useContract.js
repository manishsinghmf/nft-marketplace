// src/tests/mocks/useContract.js

export const useContract = () => ({
    publicClient: {
        readContract: vi.fn(),
        writeContract: vi.fn(),
    },
    walletClient: {
        writeContract: vi.fn(),
    },
    nftContract: {},
    marketplaceContract: {},
});
