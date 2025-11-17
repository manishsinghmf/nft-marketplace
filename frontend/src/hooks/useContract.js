// src/hooks/useContract.js
import {
    usePublicClient,
    useWalletClient,
    useReadContract as wagmiRead,
    useWriteContract as wagmiWrite,
} from "wagmi";
import { CONTRACTS } from "../config/contracts";

/**
 * getContract(chainId, name)
 */
export function getContract(chainId, name) {
    const id = Number(chainId);
    if (!id) return null;

    const chainConfig = CONTRACTS[id];
    if (!chainConfig) return null;

    return chainConfig[name] ?? null;
}

/**
 * useContract(chainId)
 */
export default function useContract(chainId) {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const contracts = CONTRACTS[chainId] || {};

    return {
        publicClient,
        walletClient,
        nftContract: contracts?.nft ?? null,
        marketplaceContract: contracts?.marketplace ?? null,
    };
}

/**
 * readFromContract()
 * Generic async read using provided public client
 */
export async function readFromContract({ chainId, contractName, functionName, client, args = [],
    account }) {
    try {
        const contract = getContract(chainId, contractName);
        if (!contract) throw new Error("Contract not configured");
        if (!client) throw new Error("Public client required");
        const data = await client.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName,
            args,
            ...(account ? { account } : {}),
        });
        return { data, error: null };
    } catch (error) {
        console.error("readFromContract error:", error);
        return { data: null, error };
    }
}

/**
 * writeToContract()
 * Generic async write using provided wallet client
 */
export async function writeToContract({ chainId, contractName, functionName, walletClient, args = [], value, options = {} }) {
    try {
        const contract = getContract(chainId, contractName);
        if (!contract) throw new Error("Contract not configured");
        if (!walletClient) throw new Error("Wallet client required");
        const hash = await walletClient.writeContract({
            address: contract.address,
            abi: contract.abi,
            functionName,
            args,
            value,
            ...options,
        });
        return { hash, error: null };
    } catch (error) {
        console.error("writeToContract error:", error);
        return { hash: null, error };
    }
}

/**
 * useReadFromContract (hook wrapper)
 */
export function useReadFromContract({ chainId, contractName, functionName, args = [], watch = false }) {
    const contract = getContract(chainId, contractName);
    if (!contract) return { data: null, error: new Error("Contract not configured"), isError: true };
    return wagmiRead({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
        watch,
    });
}

/**
 * useWriteToContract (hook wrapper)
 */
export function useWriteToContract({ chainId, contractName, functionName }) {
    const contract = getContract(chainId, contractName);
    if (!contract) return { writeAsync: async () => { throw new Error("Contract not configured"); }, isLoading: false };
    return wagmiWrite({ address: contract.address, abi: contract.abi, functionName });
}
