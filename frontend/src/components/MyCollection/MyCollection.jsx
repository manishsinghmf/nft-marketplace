import { useState, useEffect } from "react";
import "./MyCollection.css";

import Detail from "../Detail/Detail";
import NoItem from "../NoItem/NoItem";

import { useAccount, usePublicClient } from "wagmi";
import { ContractService } from "../../services/contractService";
import { CONTRACTS } from "../../config/contracts";
import { useModalStore } from "../../store/modalStore";
import NFTCard from "../NFTCard/NFTCard";

export default function MyCollection() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();

  const { openModal, closeModal, setModal } = useModalStore();

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [listedNFTs, setListedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const chainConfig = CONTRACTS[chainId];
  const currency = chainConfig?.name || "ETH";

  useEffect(() => {
    const load = async () => {
      if (!isConnected || !publicClient || !address || !chainId) {
        setOwnedNFTs([]);
        setListedNFTs([]);
        return;
      }

      // 🔥 Show spinner modal
      openModal(
        "Loading...",
        "Fetching NFTs...",
        false,        // spinner mode
        "loader"
      );

      try {
        const owned = await ContractService.fetchAndResolveNFTs({
          source: "nftContract",
          chainId,
          publicClient,
          address,
        });

        const listed = await ContractService.fetchAndResolveNFTs({
          source: "myListings",
          chainId,
          publicClient,
          address,
        });

        setOwnedNFTs(owned || []);
        setListedNFTs(listed || []);

        // 🔥 Done — hide loader
        closeModal("loader");

      } catch (err) {
        console.error("MyCollection load error:", err);

        setModal({
          heading: "Error",
          description: "Failed to fetch your NFTs",
          buttonEnabled: true
        });
      }
    };

    load();
  }, [address, chainId, isConnected, publicClient]);

  if (!isConnected)
    return (
      <div className="dashboard-empty">
        Please connect your wallet to view your collection.
      </div>
    );

  if (!ownedNFTs.length && !listedNFTs.length)
    return (
      <NoItem
        heading="No NFTs Found"
        content="You do not own or have any listed NFTs yet."
      />
    );

  return (
    <div className="dashboard-create-item-containers">

      {/* Owned NFTs */}
      {ownedNFTs.length > 0 && (
        <section className="w-full nft-section">
          <h2 className="dashboard-heading px-12 mt-6">My NFT Collection</h2>
          <div className="nft-grid">
            {ownedNFTs.map((n) => (
              <NFTCard
                key={n.nftId}
                nft={n}
                currency={currency}
                showMore={false}
                showPrice={false}
                ctaText="Details"
                onCta={() => setSelectedNFT(n)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Listed NFTs */}
      {listedNFTs.length > 0 && (
        <section className="w-full nft-section">
          <h2 className="dashboard-heading px-12 mt-6">Listed For Sale</h2>

          <div className="nft-grid">
            {listedNFTs.map((n) => (
              <NFTCard
                key={n.nftId}
                nft={n}
                currency={currency}
                showMore={false}
                showPrice={false}
                ctaText="Details"
                onCta={() => setSelectedNFT(n)}
              />
            ))}
          </div>
        </section>
      )}

      {/* NFT Detail modal */}
      {selectedNFT && (
        <Detail
          nft_data={selectedNFT}
          setshowDetail={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
}
