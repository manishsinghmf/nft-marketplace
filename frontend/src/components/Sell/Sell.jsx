// src/components/Sell/Sell.jsx
import { useEffect, useState } from "react";
import "./Sell.css";

import Detail from "../Detail/Detail";
import NoItem from "../NoItem/NoItem";
import PriceModal from "../PriceModal/PriceModal";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ContractService } from "../../services/contractService";
import { useModalStore } from "../../store/modalStore";
import { CONTRACTS } from "../../config/contracts";
import { formatEther } from "viem";

export default function Sell() {
  const [showDetail, setShowDetail] = useState(false);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [listingPrice, setListingPrice] = useState("0");
  const [items, setItems] = useState([]);

  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openModal, setModal, closeModal } = useModalStore();

  const chainConfig = CONTRACTS[chainId];
  const currency = chainConfig?.name || "ETH";

  /** --------------------------------------------------------
   * Load listing fee
   -------------------------------------------------------- */
  useEffect(() => {
    const loadListingFee = async () => {
      if (!publicClient || !chainId) return;

      try {
        const feeWei = await ContractService.getListingPrice({
          chainId,
          publicClient,
          address
        });

        setListingPrice(formatEther(feeWei));
      } catch (err) {
        console.error("Listing fee error:", err);
        setListingPrice("0");
      }
    };

    loadListingFee();
  }, [chainId]);

  /** --------------------------------------------------------
   * Load user-owned NFTs (metadata resolved)
   -------------------------------------------------------- */
  const fetchUserNFTs = async () => {
    if (!isConnected || !publicClient || !address) return;

    openModal("Loading NFTs...", "Fetching your collection...");

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
      setModal("Error", "Failed to load NFTs.", true);
    } finally {
      closeModal();
    }
  };

  useEffect(() => {
    if (isConnected && chainConfig) fetchUserNFTs();
    else setItems([]);
  }, [isConnected, chainId]);

  /** --------------------------------------------------------
   * Open popup details
   -------------------------------------------------------- */
  const openDetails = (nft) => {
    setNftData(nft);
    setShowDetail(true);
  };

  /** --------------------------------------------------------
   * Open price modal
   -------------------------------------------------------- */
  const openPricePopup = (nft) => {
    setNftData(nft);
    setShowPricePopup(true);
  };

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
            <span className="text-[gold]">{listingPrice} {currency}</span>
          </h1>
        </div>
      </div>

      {/* NFT List */}
      {items.length > 0 ? (
        <div className="sell-page">
          <div className="sell-container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-12">
              {items.map((n) => (
                <div
                  className="max-w-sm rounded overflow-hidden shadow-lg sell-card"
                  key={n.nftId}
                >
                  <img src={n.image} alt="#" className="w-full" />

                  <div className="px-6 py-4">
                    <h5 className="font-bold text-xl mb-2">{n.name}</h5>
                    <p className="text-white-700 text-base">{n.description}</p>

                    <span className="icon">
                      <a
                        className="text-[#0000EE] underline cursor-pointer text-sm"
                        onClick={() => openDetails(n)}
                      >
                        more details
                      </a>
                    </span>
                  </div>

                  <div className="px-6 pb-4">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded sell-sc-button"
                      onClick={() => openPricePopup(n)}
                    >
                      Sell
                    </button>
                  </div>
                </div>
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
