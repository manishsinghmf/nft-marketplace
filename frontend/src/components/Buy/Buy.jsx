// src/components/Buy/Buy.jsx
import "./Buy.css";
import { useEffect, useState } from "react";

import NoItem from "../NoItem/NoItem";
import Detail from "../Detail/Detail";

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
   * Load all market items using new ContractService
   -------------------------------------------------------- */
  const loadItemsForSale = async () => {
    if (!isConnected || !publicClient || !chainId) return;

    openModal("Loading...", "Fetching NFTs on sale. Please wait...");

    try {
      // ✔ Correct unified metadata fetch
      const list = await ContractService.fetchAndResolveNFTs({
        source: "marketplace",
        chainId,
        publicClient,
      });

      // list structure: { nftId, price, image, name, uri, raw }
      // seller is inside raw.seller → flatten manually
      const mapped = list.map((item) => ({
        ...item,
        seller: item.raw?.seller,
      }));

      // remove owned NFTs
      const filtered = mapped.filter(
        (item) =>
          item.seller?.toLowerCase() !== address?.toLowerCase()
      );

      setItems(filtered || []);
    } catch (err) {
      console.error("❌ loadItemsForSale error:", err);
      setItems([]);
      setModal("Error", "Failed to load NFT marketplace items.", true);
    } finally {
      closeModal();
    }
  };

  useEffect(() => {
    if (isConnected && chainConfig) loadItemsForSale();
    else setItems([]);
  }, [isConnected, chainId]);

  /** --------------------------------------------------------
   * BUY NFT
   -------------------------------------------------------- */
  const buy = async (selectedNft) => {
    if (!walletClient || !publicClient) return;

    console.log("address", address, "selectedNFT", selectedNft)

    openModal("Preparing Transaction", "Estimating gas...", false);

    try {
      const priceWei = BigInt(Math.floor(selectedNft.price * 1e18));

      /** Gas Estimate */
      const gasInfo = await estimateTotalGasCost({
        chainId,
        contractName: "marketplace",
        functionName: CONTRACT_FUNCTIONS.MARKETPLACE.BUY,
        args: [selectedNft.nftId],
        publicClient,
        account: address,
        value: priceWei
      });

      const userBalance = await publicClient.getBalance({ address });

      if (
        !BalanceService.hasEnoughBalance({
          userBalanceWei: userBalance,
          requiredWei: gasInfo.requiredWei,
        })
      ) {
        return setModal(
          "Insufficient Balance",
          `You need at least ${gasInfo.requiredEth.toFixed(5)} ${currency} to buy this NFT.`,
          true
        );
      }

      setModal("Confirm Purchase", "Please confirm in your wallet...", false);

      /** BUY Transaction */
      const { tx } = await ContractService.buyMarketItem({
        chainId,
        itemId: selectedNft.nftId, // 🔥 Fix: use nftId, not itemId (your contract passes tokenId)
        value: priceWei,
        walletClient,
      });

      setModal(
        "Transaction Sent",
        `View on explorer: <a href="${chainConfig.explorerUrl}${tx}" target="_blank">${tx}</a>`
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      if (receipt.status === "success") {
        setModal(
          "Success",
          `NFT purchased! <a href="${chainConfig.explorerUrl}${tx}" target="_blank">${tx}</a>`,
          true
        );

        loadItemsForSale();
      } else {
        setModal("Failed", "The transaction was reverted.", true);
      }
    } catch (err) {
      console.error("❌ BUY error:", err);
      setModal("Error", err.message || "Transaction failed.", true);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-12">
          {items.map((i) => (
            <div
              className="max-w-sm rounded overflow-hidden shadow-lg buy-card"
              key={i.nftId}
            >
              <img src={i.image} alt="#" className="w-full" />

              <div className="px-6 py-4">
                <h5 className="font-bold text-xl mb-2">{i.name}</h5>
                <p className="text-white-700 text-base">{i.description}</p>

                <p className="text-[gold] font-extrabold text-base">
                  Price: {i.price} {currency}
                </p>

                <span className="icon">
                  <a
                    className="text-[#0000EE] underline cursor-pointer text-sm"
                    onClick={() => openPopup(i)}
                  >
                    more details
                  </a>
                </span>
              </div>

              <div className="px-6 pb-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded buy-sc-button"
                  onClick={() => buy(i)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetail && (
        <Detail setshowDetail={setShowDetail} nft_data={nftData} />
      )}
    </div>
  );
}
