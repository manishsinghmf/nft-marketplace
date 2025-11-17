// src/hooks/useWallet.js
import { formatEther } from "viem";
import {
    useAccount,
    useBalance,
    useSwitchChain,
    useDisconnect,
    useChainId,
} from "wagmi";
import { supportedChains } from "../config/chains.js";

/**
 * useWallet()
 * Centralized hook for accessing wallet + chain state.
 * Compatible with Wagmi v2 (Viem-based).
 */
export default function useWallet() {
    // 🌐 Account info
    const { address, status, isConnected } = useAccount();
    const chainId = useChainId();

    // 💰 Balance info
    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address,
        query: { enabled: !!address },
    });

    // ⛓️ Chain management (Wagmi v2 syntax)
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

    // 🧩 Find currently active chain object
    const activeChain = supportedChains.find((c) => c.id === chainId);

    // 🔌 Disconnect wallet
    const { disconnect } = useDisconnect();

    return {
        // Wallet state
        address,
        isConnected,
        isDisconnected: status === "disconnected",
        chainId,
        activeChain,
        chains: supportedChains,

        // Balance
        balance: balanceData ? formatEther(balanceData.value) : "0",
        balanceSymbol: balanceData?.symbol ?? activeChain?.nativeCurrency?.symbol ?? "ETH",
        refetchBalance,

        // Actions
        disconnect,
        switchChain,
        isSwitchingChain,
    };
}
