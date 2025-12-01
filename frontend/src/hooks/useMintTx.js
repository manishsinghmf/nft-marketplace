import { useNavigate } from "react-router-dom";
import { useModalStore } from "../store/modalStore";
import { IpfsService } from "../services/ipfsService";
import { ContractService } from "../services/contractService";
import { estimateTotalGasCost } from "../services/gasService";
import { BalanceService } from "../services/balanceService";
import { CONTRACT_FUNCTIONS } from "../config/contractFunctions";
import { formatError } from "../utils/formatError";
import { UPLOADING_METADATA_DESC, UPLOADING_METADATA, UPLOADING_IMAGE, UPLOADING_IMAGE_DESC, } from "../utils/messageConstants";

export default function useMintTx({
    chainConfig,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
}) {
    const navigate = useNavigate();
    const openModal = useModalStore((s) => s.openModal);
    const setModal = useModalStore((s) => s.setModal);

    const mint = async (formData) => {
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

            if (!chainConfig) {
                openModal("Unsupported Network", "Switch to a supported chain.", false);
                return;
            }

            if (!walletClient) {
                openModal("Wallet Error", "Wallet not connected or not authorized.", false);
                return;
            }

            // --------------------------------------------
            // STEP 1 — show first modal
            // --------------------------------------------
            openModal(
                UPLOADING_IMAGE,
                UPLOADING_IMAGE_DESC,
                true
            );

            // --------------------------------------------
            // STEP 2 — upload image to IPFS
            // --------------------------------------------
            const imageHash = await IpfsService.uploadFile(image);
            if (!imageHash) {
                setModal({
                    heading: "Failed",
                    description: "Failed to upload image.",
                    loading: false,
                });
                return;
            }

            // --------------------------------------------
            // STEP 3 — upload metadata JSON
            // --------------------------------------------
            setModal({
                heading: UPLOADING_METADATA,
                description: UPLOADING_METADATA_DESC,
                loading: true,
            });

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
                setModal({
                    heading: "Failed",
                    description: "Metadata upload failed.",
                    loading: false,
                });
                return;
            }

            // --------------------------------------------
            // STEP 4 — gas estimation
            // --------------------------------------------
            setModal({
                heading: "Estimating Gas",
                description: "Please wait...",
                loading: true,
            });

            const amount = Number(quantity);

            const gasInfo = await estimateTotalGasCost({
                chainId,
                contractName: "nft",
                functionName: CONTRACT_FUNCTIONS.NFT.MINT,
                args: [amount, metadataHash],
                publicClient,
                account: address,
            });

            const userBalanceWei = balanceData?.value || 0n;

            if (
                !BalanceService.hasEnoughBalance({
                    userBalanceWei,
                    requiredWei: gasInfo.requiredWei,
                })
            ) {
                setModal({
                    heading: "Insufficient Balance",
                    description: `You need approx ${gasInfo.requiredEth.toFixed(
                        5
                    )} ${chainConfig.name} to mint.`,
                    loading: false,
                });
                return;
            }

            // --------------------------------------------
            // STEP 5 — SEND TRANSACTION
            // --------------------------------------------
            setModal({
                heading: "Minting NFT",
                description: "Confirm transaction in your wallet...",
                loading: true,
            });

            const { tx } = await ContractService.mintNFT({
                chainId,
                amount,
                metadataHash,
                walletClient,
            });

            const explorer = `${chainConfig.explorerUrl}${tx}`;

            setModal({
                heading: "Transaction Sent",
                description: `View on explorer: <a href="${explorer}" target="_blank">${tx}</a>`,
                loading: true,
            });

            // --------------------------------------------
            // STEP 6 — WAIT FOR RECEIPT
            // --------------------------------------------
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

            if (receipt.status === "success") {
                setModal({
                    heading: "Mint Successful!",
                    description: `Your NFT is minted.<br/><a href="${explorer}" target="_blank">${tx}</a>`,
                    loading: false,
                });

                navigate("/my-collection");
            } else {
                setModal({
                    heading: "Failed",
                    description: "The transaction reverted.",
                    loading: false,
                });
            }
        } catch (err) {
            setModal({
                heading: "Error",
                description: err?.message || "Unexpected error. Try again.",
                description: err?.message ? formatError(err) : "Unexpected error. Try again.",
                loading: true,
            });
        }
    };

    return { mint };
}
