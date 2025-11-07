import { walletClient, publicClient, } from './clients'; // your viem setup
import { formatEther, formatUnits, parseUnits, createPublicClient, custom, http } from "viem";
import { mainnet } from 'viem/chains';

export const connectToMetamaskAccount = async () => {
    try {
        const addresses = await walletClient.requestAddresses();
        return addresses.length ? addresses[0] : null;
    } catch (error) {
        console.log("Error in connecting with metamask: ", error);
        return null;
    }
};

export const connectToSpecificMetamaskNetwork = async (id) => {
    try {
        await walletClient.switchChain({ id: Number(id) });
        return true;
    } catch (error) {
        if (error.code === -32002) return true;
        console.log("Error in connecting with metamask: ", error);
        return null;
    }
};

export const checkIsMetamaskPresent = () => {
    return typeof window !== 'undefined' && !!window.ethereum;
};

export const checkIsMetamaskConnected = async () => {
    try {
        const addresses = await walletClient.getAddresses();
        return addresses.length ? addresses[0] : null;
    } catch (error) {
        console.log("Error in checking metamask connected account: ", error);
        return null;
    }
};

export const getChainConnected = async () => {
    try {
        const chain = await walletClient.getChainId();
        return chain ? `0x${chain.toString(16)}` : null; // returning hex to match old format
    } catch (error) {
        console.log("Error in fetching chain id from metamask: ", error);
        return null;
    }
};

export const connectToWeb3 = (provider) => {
    try {
        const client = createPublicClient({
            chain: mainnet,
            transport: provider ? custom(provider) : http(),
        });
        return client;
    } catch (error) {
        console.log("Error connecting to viem client: ", error);
        return null;
    }
};

export const getWalletBalance = async (address) => {
    try {
        const balance = await publicClient.getBalance({ address });
        return formatEther(balance);
    } catch (error) {
        console.log("Error in fetching wallet balance: ", error);
        return 0;
    }
};

export const getAllNftsOfUser = async (contract, account) => {
    try {
        // Viem uses readContract({ address, abi, functionName, args })
        const data = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getUserNFTs",
            account: account,
        });
        return data;
    } catch (error) {
        console.log("Error in fetching user NFT's:", error);
        return null;
    }
};

export const getAllListedNftsOfUser = async (contract, account) => {
    try {
        const data = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "fetchMyNfts",
            account,
        });
        return data;
    } catch (error) {
        console.log("Error in fetching user NFT's:", error);
        return null;
    }
};

export const getListingPrice = async (contract) => {
    try {
        const price = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "listingPrice",
        });
        return formatEther(price);
    } catch (error) {
        console.log("Error in fetching listing price:", error);
        return null;
    }
};

export const getAllUnsoldNfts = async (contract) => {
    try {
        const data = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "fetchMarketItems",
        });
        return data;
    } catch (error) {
        console.log("Error in fetching all unsold NFT's:", error);
        return null;
    }
};

export const noExponents = function (num) {
    var data = String(num).split(/[eE]/);
    if (data.length === 1) return data[0];
    var z = '', sign = num < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1;
    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
};

export const convertToEther = (data, decimals = 18) => {
    if (data == 0) return 0;
    return formatUnits(BigInt(data), decimals);
};

export const convertToWei = (data, decimals = 18) => {
    return parseUnits(data.toString(), decimals).toString();
};


