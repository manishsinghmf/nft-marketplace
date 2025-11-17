// src/config/contracts.js
import { marketplaceAbi } from "./abis/marketplaceAbi";
import { nftAbi } from "./abis/fandomNftAbi";

/**
 * CONTRACTS
 * Organized by numeric chainId (for wagmi compatibility).
 * Each chain has `nft` and `marketplace` contract details.
 */
export const CONTRACTS = {
    // 🚀 Sepolia (Ethereum Testnet)
    11155111: {
        name: "Sepolia",
        currency: "ETH",
        explorerUrl: "https://sepolia.etherscan.io/tx/",
        nft: {
            address: "0xbA6De6117C661D3BBa39c9E0Ee83763B80E9cEf4",
            abi: nftAbi,
        },
        marketplace: {
            address: "0xB22141236071EFf920f6b8bfC221C2C2AF776C92",
            abi: marketplaceAbi,
        },
    },

    // 🌐 Polygon Mumbai (Testnet)
    80001: {
        name: "Mumbai Matic",
        currency: "MATIC",
        explorerUrl: "https://mumbai.polygonscan.com/tx/",
        nft: {
            address: "0x2D0426A1B870F1f72A321F529E1154CE78c6f4B3",
            abi: nftAbi,
        },
        marketplace: {
            address: "0xF0dF57b57B2B9F911e2d4e16F842874cF390847a",
            abi: marketplaceAbi,
        },
    },

    // ❄️ Avalanche Fuji Testnet
    43113: {
        name: "Avalanche Fuji",
        currency: "AVAX",
        explorerUrl: "https://testnet.snowtrace.io/tx/",
        nft: {
            address: "0xFb85190704f0ca44F0a5f447EFF6cba49AB23B2B",
            abi: nftAbi,
        },
        marketplace: {
            address: "0xC0a57943372B34D10e09AA7E539Ee3BA5d7BD6C2",
            abi: marketplaceAbi,
        },
    },
};

export const DEFAULT_CHAIN_ID = 11155111; // Sepolia

/**
 * Helper to safely get chain config by ID
 */
export const getChainConfig = (chainId) => CONTRACTS[Number(chainId)] || null;

export const chainProperties = Object.fromEntries(
    Object.entries(CONTRACTS).map(([id, c]) => [
        "0x" + Number(id).toString(16),
        {
            chain: c.name,
            currency: c.currency,
            nftAddress: c.nft.address,
            marketplaceAddress: c.marketplace.address,
            explorerUrl: c.explorerUrl,
        },
    ])
);
