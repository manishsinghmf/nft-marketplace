// src/services/gasService.js
import { formatEther } from "viem";
import { CONTRACTS } from "../config/contracts";

/**
 * estimateTotalGasCost:
 * - uses supplied publicClient
 * - returns { requiredWei: bigint, requiredEth: number, gasEstimate, gasPrice }
 * - defensive: checks contract config from CONTRACTS (canonical registry)
 */
export async function estimateTotalGasCost({
    chainId,
    contractName,
    functionName,
    args = [],
    publicClient,
    account,
    value = 0n,
}) {
    if (!publicClient) throw new Error("publicClient required");
    if (!chainId) throw new Error("chainId required");

    const chainContracts = CONTRACTS?.[Number(chainId)];
    const contract = chainContracts?.[contractName];
    if (!contract) throw new Error(`Contract ${contractName} not configured for chain ${chainId}`);

    try {
        const gasEstimate = await publicClient.estimateContractGas({
            address: contract.address,
            abi: contract.abi,
            functionName,
            args,
            account,
            value: BigInt(value),
        });

        const gasPrice = await publicClient.getGasPrice();

        const geBig = BigInt(gasEstimate);
        const gpBig = BigInt(gasPrice);
        const valBig = BigInt(value);

        const requiredWei = geBig * gpBig + valBig;
        const requiredEth = Number(formatEther(requiredWei));

        return {
            requiredWei,
            requiredEth,
            gasEstimate: geBig,
            gasPrice: gpBig,
        };
    } catch (err) {
        console.error("estimateTotalGasCost error:", err);
        throw err;
    }
}


export default estimateTotalGasCost;
