// src/components/Sell/Sell.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import "./Sell.css";
import "../NFTCard/NFTCommon.css";

import Detail from "../Detail/Detail";
import NoItem from "../NoItem/NoItem";
import PriceModal from "../PriceModal/PriceModal";
import NFTCard from "../NFTCard/NFTCard";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ContractService } from "../../services/contractService";
import { useModalStore } from "../../store/modalStore";
import { CONTRACTS } from "../../config/contracts";
import { formatEther } from "viem";

export default function Sell() {
  console.log("Sell Render");

  const [showDetail, setShowDetail] = useState(false);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [listingPrice, setListingPrice] = useState("0");
  const [items, setItems] = useState([]);

  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();

  // Zustand optimized selectors
  const openModal = useModalStore((s) => s.openModal);
  const setModal = useModalStore((s) => s.setModal);
  const closeModal = useModalStore((s) => s.closeModal);

  // Memoized chain config
  const chainConfig = useMemo(() => CONTRACTS[chainId], [chainId]);
  const currency = chainConfig?.name || "ETH";

  /** --------------------------------------------------------
   * Load listing fee
   -------------------------------------------------------- */
  useEffect(() => {
    if (!publicClient || !chainId) return;

    const loadListingFee = async () => {
      try {
        const feeWei = await ContractService.getListingPrice({
          chainId,
          publicClient,
          address,
        });

        setListingPrice(formatEther(feeWei));
      } catch (err) {
        console.error("Listing fee error:", err);
        setListingPrice("0");
      }
    };

    loadListingFee();
  }, [publicClient, chainId, address]);

  /** --------------------------------------------------------
   * Load NFTs owned by the user
   -------------------------------------------------------- */
  const fetchUserNFTs = useCallback(async () => {
    if (!isConnected || !publicClient || !address) return;

    openModal("Loading NFTs...", "Fetching your collection...", true, "loader");

    try {
      const resolved = await ContractService.fetchAndResolveNFTs({
        source: "nftContract",
        chainId,
        publicClient,
        address,
      });
      setItems(resolved || []);
    } catch (err) {
      console.error("fetchUserNFTs err:", err);
      setItems([]);

      setModal({
        heading: "Error",
        description: "Failed to load NFTs.",
        loading: true,
      });
    } finally {
      closeModal("loader");
    }
  }, [
    isConnected,
    publicClient,
    address,
    chainId,
    openModal,
    closeModal,
    setModal,
  ]);

  useEffect(() => {
    if (isConnected && chainConfig) fetchUserNFTs();
    else setItems([]);
  }, [isConnected, chainConfig, fetchUserNFTs]);

  /** --------------------------------------------------------
   * Popup handlers (stable)
   -------------------------------------------------------- */
  const openDetails = useCallback((nft) => {
    setNftData(nft);
    setShowDetail(true);
  }, []);

  const openPricePopup = useCallback((nft) => {
    setNftData(nft);
    setShowPricePopup(true);
  }, []);

  /** --------------------------------------------------------
   * UI Rendering
   -------------------------------------------------------- */
  if (!isConnected) {
    return (
      <div className="dashboard-empty">
        Connect your wallet to list NFTs for sale.
      </div>
    );
  }

  return (
    <div>
      {/* Listing Fee Banner */}
      <div className="listing-price p-4">
        <div className="p-5 listing-price-box">
          <h1 className="text-lg font-black text-center">
            Put your artistic NFTs on sale for a fee of{" "}
            <span className="text-[gold]">
              {listingPrice} {currency}
            </span>
          </h1>
        </div>
      </div>

      {/* NFT List */}
      {items.length > 0 ? (
        <div className="page-wrapper">
          <div className="nft-section">
            <div className="nft-grid">
              {items.map((n) => (
                <NFTCard
                  key={n.nftId}
                  nft={n}
                  showMore={true}
                  onMore={openDetails}
                  ctaText="Sell"
                  onCta={openPricePopup}
                />
              ))}
            </div>
          </div>

          {showDetail && (
            <Detail nft_data={nftData} setshowDetail={setShowDetail} />
          )}

          {showPricePopup && (
            <PriceModal
              nftData={nftData}
              listingFee={listingPrice}
              setShowPricePopup={setShowPricePopup}
              refetchNFTs={fetchUserNFTs}
            />
          )}
        </div>
      ) : (
        <NoItem
          heading="No NFTs Found"
          content="You don't have any NFTs to list. Mint NFTs first!"
        />
      )}
    </div>
  );
}
