// src/components/Mint/useMintActions.js
import { useNavigate } from "react-router-dom";

import { IpfsService } from "../../services/ipfsService";
import { ContractService } from "../../services/contractService";
import { estimateTotalGasCost } from "../../services/gasService";
import { BalanceService } from "../../services/balanceService";

import { CONTRACT_FUNCTIONS } from "../../config/contractFunctions";
import { useModalStore } from "../../store/modalStore";

export default function useMintActions({
    nftInfo,
    nftImage,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
    chainConfig,
    resetForm,
}) {
    const navigate = useNavigate();
    const { openModal, setModal } = useModalStore();

    /* -----------------------------------------------------
     * VALIDATION
     ----------------------------------------------------- */
    const validate = () => {

        if (!nftImage) {
            openModal("Missing Image", "Upload an image.", true);
            return false;
        }

        if (!nftInfo.name || !nftInfo.description) {
            openModal("Missing Fields", "Name & description required.", true);
            return false;
        }

        const numeric = ["quantity", "rarity", "style", "beauty", "comedy", "action"];
        for (const key of numeric) {
            const value = nftInfo[key];
            if (value === "" || value === null || isNaN(Number(value))) {
                openModal("Invalid Input", `${key} must be a valid number`, true);
                return false;
            }

            if (Number(value) <= 0) {
                openModal("Invalid Input", `${key} must be > 0`, true);
                return false;
            }
        }

        return true;
    };

    /* -----------------------------------------------------
     * MINT FUNCTION
     ----------------------------------------------------- */
    const mint = async () => {
        if (!validate()) return;

        /* 1 — Upload image */
        openModal("Uploading Image", "Uploading NFT media to IPFS...", false);

        const imageHash = await IpfsService.uploadFile(nftImage);
        if (!imageHash) {
            return setModal("Failed", "Image upload failed.", true);
        }

        /* 2 — Upload Metadata */
        setModal("Uploading Metadata", "Uploading metadata to IPFS...");

        const metadataHash = await IpfsService.uploadNFTMetadata(nftInfo, imageHash);
        if (!metadataHash) {
            return setModal("Failed", "Metadata upload failed.", true);
        }

        /* 3 — Gas Estimate */
        setModal("Estimating Gas", "Preparing transaction...");

        const amount = Number(nftInfo.quantity);

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

        /* 4 — Send Mint Transaction */
        setModal("Minting NFT", "Confirm transaction in your wallet...", false);

        const { tx } = await ContractService.mintNFT({
            chainId,
            amount,
            metadataHash,
            walletClient,
        });

        const explorer = chainConfig.explorerUrl + tx;

        setModal(
            "Transaction Sent",
            `View on explorer: <a href="${explorer}" target="_blank">${tx}</a>`,
            false
        );

        /* 5 — Wait for receipt */
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

        if (receipt.status === "success") {
            setModal(
                "Mint Successful!",
                `Your NFT is minted!<br/><a href="${explorer}" target="_blank">${tx}</a>`,
                true
            );
            resetForm();
            navigate("/my-collection");
        } else {
            setModal("Failed", "The mint transaction reverted.", true);
        }
    };

    return { mint };
}
