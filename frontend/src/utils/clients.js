import { createPublicClient, createWalletClient, custom, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

const chain = import.meta.env.VITE_NETWORK === "sepolia" ? sepolia : mainnet;

export const publicClient = createPublicClient({
    chain,
    transport: http(),
});

export const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
});