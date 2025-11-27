// src/components/Buy/Buy.jsx
import "./Buy.css";
import "../NFTCard/NFTCommon.css";

import { useEffect, useState, useMemo, useCallback } from "react";

import NoItem from "../NoItem/NoItem";
import Detail from "../Detail/Detail";
import NFTCard from "../NFTCard/NFTCard";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ContractService } from "../../services/contractService";
import { estimateTotalGasCost } from "../../services/gasService";
import { BalanceService } from "../../services/balanceService";
import { useModalStore } from "../../store/modalStore";

import { CONTRACTS } from "../../config/contracts";
import { CONTRACT_FUNCTIONS } from "../../config/contractFunctions";
import { formatError } from "../../utils/formatError";

export default function Buy() {
  console.log("Buy Render");

  const [items, setItems] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [nftData, setNftData] = useState(null);

  // Wagmi
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Zustand — optimized selectors (avoids global re-renders)
  const openModal = useModalStore((s) => s.openModal);
  const setModal = useModalStore((s) => s.setModal);
  const closeModal = useModalStore((s) => s.closeModal);

  // Memoized chain config (prevents effect re-firing)
  const chainConfig = useMemo(() => CONTRACTS[chainId], [chainId]);
  const currency = chainConfig?.name || "ETH";

  /** --------------------------------------------------------
   * Load NFTs — memoized to avoid creating a new function each render
   -------------------------------------------------------- */
  const loadItemsForSale = useCallback(async () => {
    if (!isConnected || !publicClient || !chainId) return;

    openModal("Loading...", "Fetching NFTs on sale. Please wait...", true, "loader");

    try {
      const list = await ContractService.fetchAndResolveNFTs({
        source: "marketplace",
        chainId,
        publicClient,
      });

      const mapped = list.map((item) => ({
        ...item,
        seller: item.raw?.seller,
      }));

      const filtered = mapped.filter(
        (item) => item.seller?.toLowerCase() !== address?.toLowerCase()
      );

      setItems(filtered || []);

      closeModal("loader");
    } catch (err) {
      console.error("❌ loadItemsForSale error:", err);
      setItems([]);
      openModal("Error", "Failed to load NFT marketplace items.", true, "loader");
    }
  }, [isConnected, publicClient, chainId, address, openModal, closeModal]);

  /** --------------------------------------------------------
   * Fire only when user connects or changes chain
   -------------------------------------------------------- */
  useEffect(() => {
    if (isConnected && chainConfig) loadItemsForSale();
    else setItems([]);
  }, [isConnected, chainConfig, loadItemsForSale]);

  /** --------------------------------------------------------
   * BUY Handler (memoized)
   -------------------------------------------------------- */
  const buy = useCallback(
    async (selectedNft) => {
      if (!walletClient || !publicClient) return;

      openModal("Preparing Transaction", "Estimating gas...", false, "buy");

      try {
        const priceWei = BigInt(Math.floor(selectedNft.price * 1e18));

        const gasInfo = await estimateTotalGasCost({
          chainId,
          contractName: "marketplace",
          functionName: CONTRACT_FUNCTIONS.MARKETPLACE.BUY,
          args: [selectedNft.itemId],
          publicClient,
          account: address,
          value: priceWei,
        });

        const userBalance = await publicClient.getBalance({ address });

        if (!BalanceService.hasEnoughBalance({
          userBalanceWei: userBalance,
          requiredWei: gasInfo.requiredWei,
        })) {
          return setModal({
            heading: "Insufficient Balance",
            description: `You need at least ${gasInfo.requiredEth.toFixed(5)} ${currency} to buy this NFT.`,
            loading: true,
          });
        }

        setModal({
          heading: "Confirm Purchase",
          description: "Please confirm in your wallet...",
          loading: false,
        });

        const { tx } = await ContractService.buyMarketItem({
          chainId,
          itemId: selectedNft.itemId,
          value: priceWei,
          walletClient,
        });

        setModal({
          heading: "Transaction Sent",
          description: `View on explorer: <a href="${chainConfig.explorerUrl}${tx}" target="_blank">${tx}</a>`,
          loading: false,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        const success = receipt.status === 1 || receipt.status === "success";

        if (success) {
          setModal({
            heading: "Success",
            description: `NFT purchased! <a href="${chainConfig.explorerUrl}${tx}" target="_blank">${tx}</a>`,
            loading: true,
          });

          setTimeout(() => loadItemsForSale(), 500);
        } else {
          setModal({
            heading: "Failed",
            description: "The transaction was reverted.",
            loading: true,
          });
        }
      } catch (err) {
        console.error("❌ BUY error:", err);
        setModal({
          heading: "Error",
          description: err?.message ? formatError(err) : "Transaction failed.",
          loading: true,
        });
      }
    },
    [
      walletClient,
      publicClient,
      chainId,
      address,
      chainConfig,
      currency,
      loadItemsForSale,
      openModal,
      setModal,
    ]
  );

  /** --------------------------------------------------------
   * DETAIL POPUP
   -------------------------------------------------------- */
  const openPopup = useCallback((nft) => {
    setNftData(nft);
    setShowDetail(true);
  }, []);

  /** --------------------------------------------------------
   * UI
   -------------------------------------------------------- */
  if (!items.length || !isConnected) {
    return (
      <NoItem
        heading="No NFTs Available"
        content="There are currently no NFTs listed for sale."
      />
    );
  }

  return (
    <div className="page-wrapper">
      <div className="nft-section">
        <h2 className="dashboard-heading px-12 mt-6">Buy NFTs</h2>

        <div className="nft-grid">
          {items.map((i) => (
            <NFTCard
              key={i.nftId}
              nft={i}
              currency={currency}
              showPrice
              showMore
              onMore={openPopup}
              ctaText="Buy"
              onCta={buy}
            />
          ))}
        </div>
      </div>

      {showDetail && <Detail setshowDetail={setShowDetail} nft_data={nftData} />}
    </div>
  );
}
