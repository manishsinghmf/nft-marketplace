// src/components/PriceModal/PriceModal.jsx
import React, { useState, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import "./PriceModal.css";

import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";

import { CONTRACTS } from "../../config/contracts";
import { CONTRACT_FUNCTIONS } from "../../config/contractFunctions";
import { useModalStore } from "../../store/modalStore";

import { ContractService } from "../../services/contractService";
import { estimateTotalGasCost } from "../../services/gasService";
import { BalanceService } from "../../services/balanceService";
import { formatError } from "../../utils/formatError";

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

    const openModal = useModalStore((s) => s.openModal);
    const setModal = useModalStore((s) => s.setModal);

    const chainConfig = useMemo(() => CONTRACTS[chainId] || null, [chainId]);
    const currency = chainConfig?.name ?? "ETH";

    const portalRoot = document.getElementById("modal-root");
    if (!portalRoot) return null;

    /** ---------------------------------------------------
     * INPUT HANDLERS
     --------------------------------------------------- */
    const handleCancel = useCallback(() => {
        setShowPricePopup(false);
        setPrice("");
    }, [setShowPricePopup]);

    const handlePriceInput = useCallback((e) => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) setPrice(val);
    }, []);

    /** ---------------------------------------------------
     * CONFIRM HANDLER (Kept exactly same logic)
     --------------------------------------------------- */
    const handleConfirm = useCallback(async () => {
        setShowPricePopup(false);

        if (!chainConfig)
            return openModal("Unsupported Network", "Please switch network.", false);

        const numericPrice = Number(price);
        if (!numericPrice || numericPrice <= 0)
            return openModal("Invalid Price", "Price must be greater than 0.", false);

        if (numericPrice < Number(listingFee))
            return openModal(
                "Invalid Price",
                `Price cannot be lower than listing fee (${listingFee} ${currency}).`,
                false
            );

        openModal(
            "Preparing Sell Transaction",
            "Checking approval, estimating gas...",
            true
        );

        try {
            const priceWei = parseEther(price);
            const listingFeeWei = parseEther(String(listingFee));

            // STEP 1: approval
            const isApproved = await ContractService.checkApproval({
                chainId,
                owner: address,
                operator: chainConfig.marketplace.address,
                publicClient,
                account: address,
            });

            if (!isApproved) {
                setModal({
                    heading: "Approval Required",
                    description: "Confirm approval in your wallet...",
                    loading: true,
                });

                const tx = await ContractService.approveAll({
                    chainId,
                    operator: chainConfig.marketplaceAddress,
                    walletClient,
                });

                await publicClient.waitForTransactionReceipt({ hash: tx });
            }

            // STEP 2: gas estimate
            const gasInfo = await estimateTotalGasCost({
                chainId,
                contractName: "marketplace",
                functionName: CONTRACT_FUNCTIONS.MARKETPLACE.CREATE_ITEM,
                args: [nftData.nftId, priceWei, nftData.amount],
                publicClient,
                account: address,
                value: listingFeeWei,
            });

            const userBalance = balanceData?.value || 0n;

            if (
                !BalanceService.hasEnoughBalance({
                    userBalanceWei: userBalance,
                    requiredWei: gasInfo.requiredWei,
                })
            ) {
                return setModal({
                    heading: "Insufficient Balance",
                    description: `You need approx ${gasInfo.requiredEth.toFixed(
                        5
                    )} ${currency}.`,
                    loading: false,
                });
            }

            // STEP 3: submit tx
            setModal({
                heading: "Listing NFT",
                description: "Submitting transaction...",
                loading: true,
            });

            const { tx } = await ContractService.createMarketItem({
                chainId,
                nftId: nftData.nftId,
                priceWei,
                amount: nftData.amount,
                listingFeeWei,
                walletClient,
            });

            const explorerUrl = chainConfig.explorerUrl + tx;

            setModal({
                heading: "Transaction Sent",
                description: `View: <a href="${explorerUrl}" target="_blank">${tx}</a>`,
                loading: true,
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

            if (receipt.status === "success") {
                setModal({
                    heading: "NFT Listed Successfully!",
                    description: `View on explorer: <a href="${explorerUrl}" target="_blank">${tx}</a>`,
                    loading: false,
                });
                await refetchNFTs?.();
            } else {
                setModal({
                    heading: "Failed",
                    description: "The transaction was reverted.",
                    loading: false,
                });
            }
        } catch (err) {
            console.error("Sell Error:", err);
            setModal({
                heading: "Sell Transaction Failed",
                description: err?.message ? formatError(err) : "Transaction failed.",
                loading: false,
            });
        }
    }, [
        setShowPricePopup,
        chainConfig,
        address,
        publicClient,
        walletClient,
        price,
        listingFee,
        currency,
        balanceData?.value,
        nftData,
        openModal,
        setModal,
        refetchNFTs
    ]);

    /** ---------------------------------------------------
     * JSX CONTENT — Updated UI layout
     --------------------------------------------------- */
    const content = (
        <>
            {/* Dark background */}
            <div className="price-overlay-bg" onClick={handleCancel} />

            {/* Center wrapper */}
            <div className="price-modal-wrapper">
                <div className="price-popup">
                    <h2 className="text-2xl font-bold text-center mb-4">Sell NFT</h2>
                    <hr />

                    <div className="price-content">
                        <span>Enter Price (in {currency})</span>
                        <input
                            type="number"
                            className="price-input"
                            placeholder={`Enter price in ${currency}`}
                            value={price}
                            onChange={handlePriceInput}
                        />
                    </div>

                    <div className="price-footer">
                        <button className="btn-confirm" onClick={handleConfirm}>
                            Confirm
                        </button>
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return ReactDOM.createPortal(content, portalRoot);
}
