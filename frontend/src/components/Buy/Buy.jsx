// src/components/Buy/Buy.jsx
import "./Buy.css";
import { useEffect, useState } from "react";

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

export default function Buy() {
  const [items, setItems] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [nftData, setNftData] = useState(null);

  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { openModal, setModal, closeModal } = useModalStore();

  const chainConfig = CONTRACTS[chainId];
  const currency = chainConfig?.name || "ETH";

  /** --------------------------------------------------------
   * Load all market items (LOADER CONTEXT)
   -------------------------------------------------------- */
  const loadItemsForSale = async () => {
    if (!isConnected || !publicClient || !chainId) return;

    // Mark this modal as loader-owned
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

      // Only close if this function opened the modal
      closeModal("loader");

    } catch (err) {
      console.error("❌ loadItemsForSale error:", err);
      setItems([]);

      // Show error under loader context
      openModal("Error", "Failed to load NFT marketplace items.", true, "loader");
    }
  };

  useEffect(() => {
    if (isConnected && chainConfig) loadItemsForSale();
    else setItems([]);
  }, [isConnected, chainId]);

  /** --------------------------------------------------------
   * BUY FLOW (BUY CONTEXT)
   -------------------------------------------------------- */
  const buy = async (selectedNft) => {
    if (!walletClient || !publicClient) return;

    // This modal belongs to BUY flow
    openModal("Preparing Transaction", "Estimating gas...", false, "buy");

    try {
      const priceWei = BigInt(Math.floor(selectedNft.price * 1e18));

      /** Gas Estimate */
      const gasInfo = await estimateTotalGasCost({
        chainId,
        contractName: "marketplace",
        functionName: CONTRACT_FUNCTIONS.MARKETPLACE.BUY,
        args: [selectedNft.itemId],
        publicClient,
        account: address,
        value: priceWei
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

      // Update modal but KEEP BUY CONTEXT
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

      // Update content only
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

        // Let success modal show FIRST, then load items
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
  };

  /** --------------------------------------------------------
   * DETAILS POPUP
   -------------------------------------------------------- */
  const openPopup = (nft) => {
    setNftData(nft);
    setShowDetail(true);
  };

  /** --------------------------------------------------------
   * UI Rendering
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
    <div className="buy-page">
      <div className="buy-container mx-auto px-4 pb-8">
        <div className="nft-grid">
          {items.map((i) => (
            <NFTCard
              key={i.nftId}
              nft={i}
              currency={currency}
              showPrice={true}
              showMore={true}
              onMore={(n) => openPopup(n)}
              ctaText="Buy"
              onCta={(n) => buy(n)}
            />

          ))}
        </div>
      </div>

      {showDetail && (
        <Detail setshowDetail={setShowDetail} nft_data={nftData} />
      )}
    </div>

  );
}
