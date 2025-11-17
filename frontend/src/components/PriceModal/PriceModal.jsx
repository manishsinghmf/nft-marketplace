// src/components/PriceModal/PriceModal.jsx
import "./PriceModal.css";
import { useState } from "react";

import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";

import { CONTRACTS } from "../../config/contracts";
import { CONTRACT_FUNCTIONS } from "../../config/contractFunctions";

import { useModalStore } from "../../store/modalStore";

import { ContractService } from "../../services/contractService";
import { estimateTotalGasCost } from "../../services/gasService";
import { BalanceService } from "../../services/balanceService";

export default function PriceModal({
    setShowPricePopup,
    nftData,
    listingFee,
    refetchNFTs,
}) {
    const [price, setPrice] = useState("");

    const { address, chainId } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const { data: balanceData } = useBalance({ address });

    const { openModal, setModal, closeModal } = useModalStore();

    const chainConfig = CONTRACTS[chainId];
    const currency = chainConfig?.name || "ETH";

    const handleCancel = () => {
        setShowPricePopup(false);
        setPrice("");
    };

    const handlePriceInput = (e) => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) setPrice(val);
    };

    /** -----------------------------------------------------
     * CONFIRM SELL LISTING
     ------------------------------------------------------ */
    const handleConfirm = async () => {
        if (!chainConfig) {
            return openModal(
                "Unsupported Network",
                "Please switch to a supported chain.",
                true
            );
        }

        const numericPrice = Number(price);
        if (!numericPrice || numericPrice <= 0) {
            return openModal(
                "Invalid Price",
                "Price must be greater than 0.",
                true
            );
        }

        if (numericPrice < Number(listingFee)) {
            return openModal(
                "Invalid Price",
                `Price cannot be lower than listing fee (${listingFee} ${currency}).`,
                true
            );
        }

        // Close modal UI
        setShowPricePopup(false);

        /** Step 1 — Show initial modal */
        openModal(
            "Preparing Sell Transaction",
            "Checking approval, estimating gas...",
            false
        );

        try {
            const priceWei = parseEther(price);
            const listingFeeWei = parseEther(String(listingFee));

            /* ---------------------------------------------
             * STEP 1 — APPROVAL (ERC-1155)
             --------------------------------------------- */
            const isApproved = await ContractService.checkApproval({
                chainId,
                owner: address,
                operator: chainConfig.marketplace.address,
                publicClient,
                account: address
            });

            if (!isApproved) {
                setModal(
                    "Approval Required",
                    "Confirm approval in your wallet...",
                    false
                );

                const approvalTx = await ContractService.approveAll({
                    chainId,
                    operator: chainConfig.marketplaceAddress,
                    walletClient: publicClient, // walletClient auto used inside write function
                });

                await publicClient.waitForTransactionReceipt({ hash: approvalTx });
            }

            /* ---------------------------------------------
             * STEP 2 — GAS ESTIMATION
             --------------------------------------------- */
            const gasInfo = await estimateTotalGasCost({
                chainId,
                contractName: "marketplace",
                functionName: CONTRACT_FUNCTIONS.MARKETPLACE.CREATE_ITEM,
                args: [nftData.nftId, priceWei, nftData.amount],
                publicClient,
                account: address,
                value: listingFeeWei,
            });

            /* ---------------------------------------------
             * STEP 3 — BALANCE CHECK
             --------------------------------------------- */
            const userBalance = balanceData?.value || 0n;

            if (
                !BalanceService.hasEnoughBalance({
                    userBalanceWei: userBalance,
                    requiredWei: gasInfo.requiredWei,
                })
            ) {
                return setModal(
                    "Insufficient Balance",
                    `You need approx ${gasInfo.requiredEth.toFixed(
                        5
                    )} ${currency} to list this NFT.`,
                    true
                );
            }

            /* ---------------------------------------------
             * STEP 4 — SUBMIT LISTING
             --------------------------------------------- */
            setModal("Listing NFT", "Submitting transaction...", false);

            const { tx } = await ContractService.createMarketItem({
                chainId,
                nftId: nftData.nftId,
                priceWei,
                amount: nftData.amount,
                listingFeeWei,
                walletClient: walletClient,
            });

            const explorerUrl = chainConfig.explorerUrl + tx;

            setModal(
                "Transaction Sent",
                `View on explorer: <a href="${explorerUrl}" target="_blank">${tx}</a>`
            );

            /* ---------------------------------------------
             * STEP 5 — WAIT FOR RECEIPT
             --------------------------------------------- */
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx,
            });

            if (receipt.status === "success") {
                setModal(
                    "NFT Listed Successfully!",
                    `View: <a href="${explorerUrl}" target="_blank">${tx}</a>`,
                    true
                );
                await refetchNFTs?.();
            } else {
                setModal("Failed", "The transaction was reverted.", true);
            }
        } catch (err) {
            console.error("Sell Error:", err);
            setModal(
                "Sell Transaction Failed",
                err.message || "Unexpected error occurred",
                true
            );
        }
    };

    return (
        <div className="price-overlay">
            <div className="price-popup">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Sell NFT
                </h2>
                <hr />

                <div className="mb-4 price-param text-center mt-4">
                    <span>Enter Price (in {currency})</span>
                    <br />
                    <input
                        type="number"
                        className="form-control price-input mt-3"
                        placeholder={`Enter price in ${currency}`}
                        value={price}
                        onChange={handlePriceInput}
                    />
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>

                    <button
                        className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
