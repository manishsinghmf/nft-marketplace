// src/services/tests/gasService.test.js
import estimateTotalGasCost from "../gasService";

// Mock CONTRACTS so tests do not depend on real config
vi.mock("../../config/contracts", () => ({
    CONTRACTS: {
        1: {
            nft: {
                address: "0xNFT",
                abi: [{ name: "test", type: "function" }],
            },
            marketplace: {
                address: "0xMARKET",
                abi: [{ name: "createItem", type: "function" }],
            },
        },
    },
}));

describe("estimateTotalGasCost", () => {
    const mockChainId = 1;
    const mockAccount = "0xAccount";

    let publicClient;

    beforeEach(() => {
        publicClient = {
            estimateContractGas: vi.fn(),
            getGasPrice: vi.fn(),
        };
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    test("throws error when publicClient is missing", async () => {
        await expect(
            estimateTotalGasCost({
                chainId: mockChainId,
                contractName: "marketplace",
                functionName: "createItem",
            })
        ).rejects.toThrow("publicClient required");
    });

    test("throws error when chainId is missing", async () => {
        await expect(
            estimateTotalGasCost({
                publicClient,
                contractName: "marketplace",
                functionName: "createItem",
            })
        ).rejects.toThrow("chainId required");
    });

    test("throws error for unknown contractName", async () => {
        await expect(
            estimateTotalGasCost({
                publicClient,
                chainId: mockChainId,
                contractName: "invalidContract",
                functionName: "createItem",
            })
        ).rejects.toThrow("Contract invalidContract not configured for chain 1");
    });

    test("returns correct gas estimates on success", async () => {
        // Mock viem behaviour
        publicClient.estimateContractGas.mockResolvedValueOnce(21000n);
        publicClient.getGasPrice.mockResolvedValueOnce(100n); // gas price

        const result = await estimateTotalGasCost({
            chainId: mockChainId,
            contractName: "marketplace",
            functionName: "createItem",
            args: [1, 2, 3],
            account: mockAccount,
            value: 50n,
            publicClient,
        });

        expect(result.requiredWei).toBe(21000n * 100n + 50n);
        expect(result.requiredEth).toBe(Number((21000n * 100n + 50n).toString()) / 1e18);

        expect(result.gasEstimate).toBe(21000n);
        expect(result.gasPrice).toBe(100n);

        // ensure publicClient was called correctly
        expect(publicClient.estimateContractGas).toHaveBeenCalledWith(
            expect.objectContaining({
                address: "0xMARKET",
                functionName: "createItem",
                args: [1, 2, 3],
                account: mockAccount,
                value: 50n,
            })
        );
    });

    test("throws error when viem publicClient throws", async () => {
        publicClient.estimateContractGas.mockRejectedValueOnce(new Error("gas error"));

        await expect(
            estimateTotalGasCost({
                chainId: mockChainId,
                contractName: "marketplace",
                functionName: "createItem",
                account: mockAccount,
                publicClient,
            })
        ).rejects.toThrow("gas error");
    });
});
