
import { mainnet, sepolia, polygon, optimism, base } from "wagmi/chains";

export const supportedChains = [
    mainnet,
    sepolia,
    polygon,
    optimism,
    base,
];

export const DEFAULT_CHAIN_ID = sepolia.id;