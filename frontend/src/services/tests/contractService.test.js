// src/services/tests/contractService.test.js

import { ContractService } from "../contractService";
import { readFromContract, writeToContract } from "../../hooks/useContract";
import { IpfsService } from "../ipfsService";
import CONTRACT_FUNCTIONS from "../../config/contractFunctions";
// ------------------------
// Required mocks FIRST
// ------------------------
jest.mock("../../config/ipfsConfig", () => ({
    IPFS_CONFIG: {
        GATEWAY: "https://gateway.pinata.cloud/ipfs/",
    },
}));

jest.mock("../../hooks/useContract", () => ({
    readFromContract: jest.fn(),
    writeToContract: jest.fn(),
}));

jest.mock("../ipfsService", () => ({
    IpfsService: {
        fetchMetadata: jest.fn(),
    },
}));

jest.mock("../../config/contracts", () => ({
    CONTRACTS: {
        1: {
            name: "TestNet",
            nft: { address: "0xNFT", abi: [] },
            marketplace: { address: "0xMARKET", abi: [] },
            explorerUrl: "https://example.com/tx/",
        },
    },
}));

jest.mock("../../config/contractFunctions", () => ({
    __esModule: true,
    default: {
        MARKETPLACE: {
            GET_LISTING_PRICE: "getListingPrice",
            FETCH_MARKET_ITEMS: "fetchMarketItems",
            FETCH_MY_NFTS: "fetchMyNfts",
            CREATE_ITEM: "createItem",
            BUY: "buy",
        },
        NFT: {
            GET_ALL_NFTS_OF_USER: "getAllNftsOfUser",
            IS_APPROVED_FOR_ALL: "isApprovedForAll",
            SET_APPROVAL_FOR_ALL: "setApprovalForAll",
            MINT: "mint",
        },
    },
}));

// Silence console.warn for cleaner test logs
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => { });
});

describe("ContractService", () => {
    const chainId = 1;
    const publicClient = {};
    const walletClient = {};
    const address = "0xUser";

    // -----------------------------------------------------
    // _normalizeGateway
    // -----------------------------------------------------
    describe("_normalizeGateway", () => {
        it("converts ipfs:// to default gateway", () => {
            const out = ContractService._normalizeGateway("ipfs://QmHash");
            expect(out).toBe("https://gateway.pinata.cloud/ipfs/QmHash");
        });

        it("replaces old pinata URL with new", () => {
            const oldUrl =
                "https://harlequin-major-urial-890.mypinata.cloud/ipfs/QmTest";
            const newUrl =
                "https://beige-used-manatee-520.mypinata.cloud/ipfs/QmTest";

            expect(ContractService._normalizeGateway(oldUrl)).toBe(newUrl);
        });

        it("returns original uri if unmodified", () => {
            const uri = "https://example.com/meta";
            expect(ContractService._normalizeGateway(uri)).toBe(uri);
        });

        it("returns null/undefined unchanged", () => {
            expect(ContractService._normalizeGateway(null)).toBeNull();
            expect(ContractService._normalizeGateway(undefined)).toBeUndefined();
        });
    });

    // -----------------------------------------------------
    // _resolveMetadataArray
    // -----------------------------------------------------
    describe("_resolveMetadataArray", () => {
        it("resolves metadata array successfully", async () => {
            // Mock metadata responses for BOTH items
            IpfsService.fetchMetadata
                .mockResolvedValueOnce({
                    image: "img1.png",
                    name: "NFT1",
                    description: "D1",
                    attributes: [],
                })
                .mockResolvedValueOnce({
                    image: "img2.png",
                    name: "NFT2",
                    description: "D2",
                    attributes: [],
                });

            const rawItems = [
                { tokenId: "1", uri: "https://meta/1", amount: "2" },
                { tokenId: "2", uri: "https://meta/2", amount: "3" }
            ];

            const resolved = await ContractService._resolveMetadataArray({
                rawItems,
                isListed: true,
            });

            expect(resolved).toHaveLength(2);
            expect(resolved[0]).toMatchObject({
                nftId: 1,
                name: "NFT1",
                image: "img1.png",
            });
            expect(resolved[1]).toMatchObject({
                nftId: 2,
                name: "NFT2",
                image: "img2.png",
            });
        });
    });


    // -----------------------------------------------------
    // fetchAndResolveNFTs
    // -----------------------------------------------------
    describe("fetchAndResolveNFTs", () => {
        it("fetches marketplace items and resolves metadata", async () => {
            readFromContract.mockResolvedValueOnce({
                data: [{ itemId: 1, uri: "https://meta/1" }],
                error: null,
            });

            IpfsService.fetchMetadata.mockResolvedValueOnce({
                image: "img.png",
                name: "n",
                description: "d",
                attributes: [],
            });

            const res = await ContractService.fetchAndResolveNFTs({
                source: "marketplace",
                chainId,
                publicClient,
                address,
            });

            expect(Array.isArray(res)).toBe(true);
            expect(res[0]).toMatchObject({
                itemId: 1,
                name: "n",
            });
        });

        it("throws on missing source", async () => {
            await expect(
                ContractService.fetchAndResolveNFTs({
                    chainId,
                    publicClient,
                    address,
                })
            ).rejects.toThrow("source is required");
        });

        it("throws on unknown source", async () => {
            await expect(
                ContractService.fetchAndResolveNFTs({
                    source: "invalid",
                    chainId,
                    publicClient,
                    address,
                })
            ).rejects.toThrow("Unknown NFT fetch source");
        });
    });

    // -----------------------------------------------------
    // Approval
    // -----------------------------------------------------
    describe("checkApproval", () => {
        it("returns true for approved", async () => {
            readFromContract.mockResolvedValueOnce({ data: true, error: null });
            const ok = await ContractService.checkApproval({
                chainId,
                owner: address,
                operator: "0xOp",
                publicClient,
                account: address,
            });
            expect(ok).toBe(true);
        });

        it("returns false when not approved", async () => {
            readFromContract.mockResolvedValueOnce({ data: false, error: null });
            const ok = await ContractService.checkApproval({
                chainId,
                owner: address,
                operator: "0xOp",
                publicClient,
                account: address,
            });
            expect(ok).toBe(false);
        });
    });

    // -----------------------------------------------------
    // Write actions
    // -----------------------------------------------------
    describe("approveAll", () => {
        it("returns hash on success", async () => {
            writeToContract.mockResolvedValueOnce({ hash: "0xHash", error: null });

            const result = await ContractService.approveAll({
                chainId,
                operator: "0xOp",
                walletClient,
            });

            expect(result).toBe("0xHash");
        });

        it("throws if error", async () => {
            writeToContract.mockResolvedValueOnce({
                hash: null,
                error: new Error("Approve error"),
            });

            await expect(
                ContractService.approveAll({
                    chainId,
                    operator: "0xOp",
                    walletClient,
                })
            ).rejects.toThrow("Approve error");
        });
    });

    describe("createMarketItem", () => {
        it("returns tx on success", async () => {
            writeToContract.mockResolvedValueOnce({
                tx: "0xCreate",
                error: null,
            });

            const result = await ContractService.createMarketItem({
                chainId,
                nftId: 1,
                priceWei: 100n,
                amount: 1,
                listingFeeWei: 10n,
                walletClient,
            });

            expect(result).toEqual({ tx: "0xCreate" });
        });
    });

    describe("buyMarketItem", () => {
        it("returns tx on success", async () => {
            writeToContract.mockResolvedValueOnce({
                hash: "0xBuy",
                error: null,
            });

            const result = await ContractService.buyMarketItem({
                chainId,
                itemId: 1,
                value: 100n,
                walletClient,
            });

            expect(result).toEqual({ tx: "0xBuy" });
        });
    });

    describe("mintNFT", () => {
        it("returns tx on success", async () => {
            writeToContract.mockResolvedValueOnce({
                hash: "0xMint",
                error: null,
            });

            const result = await ContractService.mintNFT({
                chainId,
                amount: 5,
                metadataHash: "QmHash",
                walletClient,
            });

            expect(result).toEqual({ tx: "0xMint" });
        });
    });

    describe("getListingPrice", () => {
        const mockChainId = 1;
        const mockPublicClient = {};
        const mockAddress = "0xUser";

        it("returns listing price when read succeeds", async () => {
            readFromContract.mockResolvedValueOnce({
                data: 123n,
                error: null,
            });

            const result = await ContractService.getListingPrice({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toBe(123n);
            expect(readFromContract).toHaveBeenCalledWith({
                chainId: mockChainId,
                contractName: "marketplace",
                functionName: "getListingPrice",
                client: mockPublicClient,
                account: mockAddress,
            });
        });

        it("returns 0n when data is null", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: null,
            });

            const result = await ContractService.getListingPrice({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toBe(0n);
        });

        it("throws when error is returned", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: new Error("Listing price error"),
            });

            await expect(
                ContractService.getListingPrice({
                    chainId: mockChainId,
                    publicClient: mockPublicClient,
                    address: mockAddress,
                })
            ).rejects.toThrow("Listing price error");
        });
    });

    describe("fetchMyNfts", () => {
        const mockChainId = 1;
        const mockPublicClient = {};
        const mockAddress = "0xUser";

        it("returns NFT array when read succeeds", async () => {
            const mockData = [{ tokenId: 1 }, { tokenId: 2 }];

            readFromContract.mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await ContractService.fetchMyNfts({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toEqual(mockData);
            expect(readFromContract).toHaveBeenCalledWith({
                chainId: mockChainId,
                contractName: "marketplace",
                functionName: "fetchMyNfts",
                client: mockPublicClient,
                args: [],
                account: mockAddress,
            });
        });

        it("returns empty array when data is null", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: null,
            });

            const result = await ContractService.fetchMyNfts({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toEqual([]);
        });

        it("throws when error is returned", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: new Error("Fetch NFTs failed"),
            });

            await expect(
                ContractService.fetchMyNfts({
                    chainId: mockChainId,
                    publicClient: mockPublicClient,
                    address: mockAddress,
                })
            ).rejects.toThrow("Fetch NFTs failed");
        });
    });

    describe("getUserNftsFromNFTContract", () => {
        const mockChainId = 1;
        const mockPublicClient = {};
        const mockAddress = "0xUser";

        it("returns NFT array when read succeeds", async () => {
            const mockData = [
                { tokenId: 1, uri: "https://meta/1" },
                { tokenId: 2, uri: "https://meta/2" },
            ];

            readFromContract.mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await ContractService.getUserNftsFromNFTContract({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toEqual(mockData);

            expect(readFromContract).toHaveBeenCalledWith({
                chainId: mockChainId,
                contractName: "nft",
                functionName: "getAllNftsOfUser",  // from mocked CONTRACT_FUNCTIONS
                client: mockPublicClient,
                args: [],
                account: mockAddress,
            });
        });

        it("returns empty array when data is null", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: null,
            });

            const result = await ContractService.getUserNftsFromNFTContract({
                chainId: mockChainId,
                publicClient: mockPublicClient,
                address: mockAddress,
            });

            expect(result).toEqual([]);
        });

        it("throws error when readFromContract returns an error", async () => {
            readFromContract.mockResolvedValueOnce({
                data: null,
                error: new Error("NFT read error"),
            });

            await expect(
                ContractService.getUserNftsFromNFTContract({
                    chainId: mockChainId,
                    publicClient: mockPublicClient,
                    address: mockAddress,
                })
            ).rejects.toThrow("NFT read error");
        });
    });

});
