import { useNavigate } from "react-router-dom";
import { useAccount, usePublicClient, useWalletClient, useBalance } from "wagmi";

import { IpfsService } from "../services/ipfsService";
import { ContractService } from "../services/contractService";
import { estimateTotalGasCost } from "../services/gasService";
import { BalanceService } from "../services/balanceService";

import { CONTRACT_FUNCTIONS } from "../config/contractFunctions";
import { useModalStore } from "../store/modalStore";

export default function useMintTx({
    chainConfig,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
}) {
    const navigate = useNavigate();
    const { openModal, setModal } = useModalStore();

    /**
     * ----------------------------------------------------
     * VALIDATION BEFORE CALLING ANYTHING EXPENSIVE
     * ----------------------------------------------------
     */
    const validateRequest = (form) => {
        if (!form) return false;

        // 1. image
        if (!form.image) {
            openModal("Missing Image", "Please upload an image.", true);
            return false;
        }

        // 2. name / description (Zod already validates but double-check)
        if (!form.name.trim() || !form.description.trim()) {
            openModal("Missing Fields", "Name & description required.", true);
            return false;
        }

        // 3. chain config
        if (!chainConfig) {
            openModal("Unsupported Network", "Switch to a supported chain.", true);
            return false;
        }

        // 4. wallet connection
        if (!walletClient) {
            openModal("Wallet Error", "Wallet not connected or not authorized.", true);
            return false;
        }

        return true;
    };

    /**
     * ----------------------------------------------------
     * MINT FUNCTION (USED BY MintForm)
     * ----------------------------------------------------
     */
    const mint = async (formData) => {
        if (!validateRequest(formData)) return;

        try {
            const {
                name,
                description,
                quantity,
                rarity,
                style,
                beauty,
                comedy,
                action,
                image,
            } = formData;

            // --------------------------------------------
            // STEP 1 — OPEN modal ONCE
            // --------------------------------------------
            openModal("Uploading Image", "Uploading NFT image to IPFS...", false);

            // --------------------------------------------
            // STEP 2 — UPLOAD IMAGE
            // --------------------------------------------
            const imageHash = await IpfsService.uploadFile(image);
            if (!imageHash) {
                return setModal("Failed", "Failed to upload image.", true);
            }

            // --------------------------------------------
            // STEP 3 — UPLOAD METADATA
            // --------------------------------------------
            setModal("Uploading Metadata", "Uploading metadata...");
            const metadata = {
                name,
                description,
                quantity,
                rarity,
                style,
                beauty,
                comedy,
                action,
            };

            const metadataHash = await IpfsService.uploadNFTMetadata(metadata, imageHash);
            if (!metadataHash) {
                return setModal("Failed", "Metadata upload failed.", true);
            }

            // --------------------------------------------
            // STEP 4 — GAS ESTIMATION
            // --------------------------------------------
            setModal("Estimating Gas", "Please wait...");

            const amount = Number(quantity);

            const gasInfo = await estimateTotalGasCost({
                chainId,
                contractName: "nft",
                functionName: CONTRACT_FUNCTIONS.NFT.MINT,
                args: [amount, metadataHash],
                publicClient,
                account: address,
            });

            const userBalance = balanceData?.value || 0n;

            if (
                !BalanceService.hasEnoughBalance({
                    userBalanceWei: userBalance,
                    requiredWei: gasInfo.requiredWei,
                })
            ) {
                return setModal(
                    "Insufficient Balance",
                    `You need approx ${gasInfo.requiredEth.toFixed(5)} ${chainConfig.name} to mint.`,
                    true
                );
            }

            // --------------------------------------------
            // STEP 5 — SEND TRANSACTION
            // --------------------------------------------
            setModal("Minting NFT", "Confirm transaction in your wallet...", false);

            const { tx } = await ContractService.mintNFT({
                chainId,
                amount,
                metadataHash,
                walletClient,
            });

            const explorer = `${chainConfig.explorerUrl}${tx}`;

            setModal(
                "Transaction Sent",
                `View on explorer: <a href="${explorer}" target="_blank">${tx}</a>`,
                false
            );

            // --------------------------------------------
            // STEP 6 — WAIT FOR RECEIPT
            // --------------------------------------------
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

            if (receipt.status === "success") {
                setModal(
                    "Mint Successful!",
                    `Your NFT is minted.<br/><a href="${explorer}" target="_blank">${tx}</a>`,
                    true
                );
                navigate("/my-collection");
            } else {
                setModal("Failed", "The transaction reverted.", true);
            }
        } catch (err) {
            setModal("Error", err?.message || "Unexpected error. Try again.", true);
        }
    };

    return { mint };
}
