// src/services/contractService.js
import { readFromContract, writeToContract } from "../hooks/useContract";
import { IpfsService } from "./ipfsService";
import { CONTRACTS } from "../config/contracts";
import CONTRACT_FUNCTIONS from "../config/contractFunctions";

/**
 * Central ContractService
 * - ALL contract reads & writes go through here
 * - Includes metadata resolution and gateway normalization
 *
 * Notes:
 * - readFromContract(...) expected to return { data, error }
 * - writeToContract(...) expected to return { hash, tx, error } (we handle both)
 */
export const ContractService = {
    /* ---------------------------
     * Basic reads (wrap-read)
     * -------------------------- */
    async getListingPrice({ chainId, publicClient, address }) {
        const { data, error } = await readFromContract({
            chainId,
            contractName: "marketplace",
            functionName: CONTRACT_FUNCTIONS.MARKETPLACE.GET_LISTING_PRICE,
            client: publicClient,
            account: address
        });
        if (error) throw error;
        return data ?? 0n;
    },

    async fetchMarketItems({ chainId, publicClient, address }) {
        const { data, error } = await readFromContract({
            chainId,
            contractName: "marketplace",
            functionName: CONTRACT_FUNCTIONS.MARKETPLACE.FETCH_MARKET_ITEMS,
            client: publicClient,
            account: address
        });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
    },

    async fetchMyNfts({ chainId, publicClient, address }) {
        const { data, error } = await readFromContract({
            chainId,
            contractName: "marketplace",
            functionName: CONTRACT_FUNCTIONS.MARKETPLACE.FETCH_MY_NFTS,
            client: publicClient,
            args: [],
            account: address
        });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
    },

    async getUserNftsFromNFTContract({ chainId, publicClient, address }) {
        const { data, error } = await readFromContract({
            chainId,
            contractName: "nft",
            functionName: CONTRACT_FUNCTIONS.NFT.GET_ALL_NFTS_OF_USER,
            client: publicClient,
            args: [],
            account: address
        });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
    },

    /* ---------------------------
     * Gateway normalization + metadata resolution
     * -------------------------- */
    _normalizeGateway(uri) {
        if (!uri) return uri;
        const OLD = "https://harlequin-major-urial-890.mypinata.cloud/ipfs/";
        const NEW = "https://beige-used-manatee-520.mypinata.cloud/ipfs/";
        // If IPFS path (ipfs://) convert to gateway if desired
        if (uri.startsWith("ipfs://")) {
            return uri.replace("ipfs://", PINATA_GATEWAY_BASE_URL || "https://ipfs.io/ipfs/");
        }
        return uri.startsWith(OLD) ? uri.replace(OLD, NEW) : uri;
    },

    async _resolveMetadataArray({ rawItems = [], isListed = false }) {
        // parallel resolution for speed
        const promises = rawItems.map(async (item) => {
            try {
                let uri = item.uri ?? item.tokenURI;
                if (!uri) return null;
                uri = this._normalizeGateway(uri);

                const metadata = await IpfsService.fetchMetadata(uri);
                if (!metadata) return null;

                return {
                    nftId: Number(item.tokenId ?? 0),
                    itemId: Number(item.itemId ?? 0),
                    image: metadata.image,
                    name: metadata.name,
                    description: metadata.description,
                    attributes: metadata.attributes ?? [],
                    uri,
                    amount: Number(item.amount ?? item.amountListed ?? item.units ?? 1),
                    price: isListed ? Number(item.price ?? 0n) / 1e18 : null,
                    raw: item,
                };
            } catch (err) {
                console.warn("ContractService._resolveMetadataArray item parse failed:", err);
                return null;
            }
        });

        const resolved = await Promise.all(promises);
        return resolved.filter(Boolean);
    },

    async fetchAndResolveNFTs({ source, chainId, publicClient, address }) {
        if (!source) throw new Error("source is required (marketplace | myListings | nftContract)");
        if (!publicClient) throw new Error("publicClient is required");

        if (source === "marketplace") {
            const raw = await this.fetchMarketItems({ chainId, publicClient, address });
            return this._resolveMetadataArray({ rawItems: raw, isListed: true });
        }

        if (source === "myListings") {
            const raw = await this.fetchMyNfts({ chainId, publicClient, address });
            return this._resolveMetadataArray({ rawItems: raw, isListed: true });
        }

        if (source === "nftContract") {
            const raw = await this.getUserNftsFromNFTContract({ chainId, publicClient, address });
            return this._resolveMetadataArray({ rawItems: raw, isListed: false });
        }

        throw new Error("Unknown NFT fetch source");
    },

    /* ---------------------------
     * Approval helpers
     * -------------------------- */
    async checkApproval({ chainId, owner, operator, publicClient, account }) {
        const { data, error } = await readFromContract({
            chainId,
            contractName: "nft",
            functionName: CONTRACT_FUNCTIONS.NFT.IS_APPROVED_FOR_ALL,
            client: publicClient,
            args: [owner, operator],
            account
        });
        if (error) throw error;
        return data === true;
    },

    async approveAll({ chainId, operator, walletClient }) {
        const result = await writeToContract({
            chainId,
            contractName: "nft",
            functionName: CONTRACT_FUNCTIONS.NFT.SET_APPROVAL_FOR_ALL,
            walletClient,
            args: [operator, true],
        });

        // writeToContract may return { hash, tx, error } - unify
        const hash = result?.hash ?? result?.tx ?? null;
        const error = result?.error ?? null;
        if (error) throw error;
        if (!hash) throw new Error("Approval transaction did not return tx hash");
        return hash;
    },

    /* ---------------------------
     * Write actions (mint / buy / create listing)
     * -------------------------- */
    async createMarketItem({ chainId, nftId, priceWei, amount, listingFeeWei, walletClient }) {
        const result = await writeToContract({
            chainId,
            contractName: "marketplace",
            functionName: CONTRACT_FUNCTIONS.MARKETPLACE.CREATE_ITEM,
            walletClient,
            args: [nftId, priceWei, amount],
            value: listingFeeWei,
        });

        const hash = result?.hash ?? result?.tx ?? null;
        const error = result?.error ?? null;
        if (error) throw error;
        if (!hash) throw new Error("createMarketItem did not return tx hash");
        return { tx: hash };
    },

    async buyMarketItem({ chainId, itemId, value, walletClient }) {
        const result = await writeToContract({
            chainId,
            contractName: "marketplace",
            functionName: CONTRACT_FUNCTIONS.MARKETPLACE.BUY,
            walletClient,
            args: [itemId],
            value,
        });

        const hash = result?.hash ?? result?.tx ?? null;
        const error = result?.error ?? null;
        if (error) throw error;
        if (!hash) throw new Error("buyMarketItem did not return tx hash");
        return { tx: hash };
    },

    async mintNFT({ chainId, amount, metadataHash, walletClient }) {
        const result = await writeToContract({
            chainId,
            contractName: "nft",
            functionName: CONTRACT_FUNCTIONS.NFT.MINT,
            walletClient,
            args: [amount, metadataHash],
        });

        const hash = result?.hash ?? result?.tx ?? null;
        const error = result?.error ?? null;
        if (error) throw error;
        if (!hash) throw new Error("mintNFT did not return tx hash");
        return { tx: hash };
    },
};

export default ContractService;
