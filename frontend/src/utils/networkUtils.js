import { supportedChains } from "../config/chains";

/**
 * Returns simplified list of supported networks for UI (e.g. dropdowns, modals)
 */
export function getSupportedNetworkList() {
    return supportedChains.map((chain) => ({
        id: chain.id,
        name: chain.name,
        symbol: chain.nativeCurrency?.symbol ?? "",
        explorer: chain.blockExplorers?.default?.url ?? "",
    }));
}

/**
 * Returns a chain display name by ID, or a fallback string.
 */
export function getChainDisplayName(chainId) {
    const chain = supportedChains.find((c) => c.id === Number(chainId));
    return chain ? chain.name : `Unknown chain (${chainId})`;
}
