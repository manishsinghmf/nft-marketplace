// src/components/MyCollection/MyCollection.jsx
import { useState, useEffect } from "react";
import "./MyCollection.css";

import Detail from "../Detail/Detail";
import NoItem from "../NoItem/NoItem";

import { useAccount, usePublicClient } from "wagmi";
import { ContractService } from "../../services/contractService";
import { CONTRACTS } from "../../config/contracts";

export default function MyCollection() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [listedNFTs, setListedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [loading, setLoading] = useState(false);

  const chainConfig = CONTRACTS[chainId];
  const currency = chainConfig?.name || "ETH";

  useEffect(() => {
    const load = async () => {
      // 🔥 FIX #1 — prevent hitting contractService without valid values
      if (!isConnected || !publicClient || !address || !chainId) {
        setOwnedNFTs([]);
        setListedNFTs([]);
        return;
      }

      setLoading(true);

      try {
        // Fetch owned NFTs
        const owned = await ContractService.fetchAndResolveNFTs({
          source: "nftContract",
          chainId,
          publicClient,
          address,
        });

        // Fetch listed NFTs
        const listed = await ContractService.fetchAndResolveNFTs({
          source: "myListings",
          chainId,
          publicClient,
          address,
        });

        setOwnedNFTs(owned || []);
        setListedNFTs(listed || []);
      } catch (err) {
        console.error("MyCollection load error:", err);
      }

      setLoading(false);
    };

    load();
  }, [address, chainId, isConnected, publicClient]); // 🔥 FIX #2 — missing dependency

  /* ---------------------------
   * UI Conditions
   * -------------------------- */
  if (!isConnected)
    return (
      <div className="dashboard-empty">
        Please connect your wallet to view your collection.
      </div>
    );

  if (loading)
    return <div className="dashboard-loading">Loading NFTs...</div>;

  if (!ownedNFTs.length && !listedNFTs.length)
    return (
      <NoItem
        heading="No NFTs Found"
        content="You do not own or have any listed NFTs yet."
      />
    );

  return (
    <div className="dashboard-create-item-containers">
      {/* ---------------------------
       * Owned NFTs
       * -------------------------- */}
      {ownedNFTs.length > 0 && (
        <section className="w-full">
          <h2 className="dashboard-heading px-12 mt-6">My NFT Collection</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-12">
            {ownedNFTs.map((n) => (
              <div
                className="max-w-sm rounded overflow-hidden shadow-lg dashboard-card"
                key={n.nftId}
                onClick={() => setSelectedNFT(n)}
              >
                <img src={n.image} alt="" className="w-full img" />
                <div className="px-6 py-4">
                  <h5 className="font-bold text-xl mb-2">{n.name}</h5>
                  <p className="text-white-700 text-base">{n.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------
       * Listed NFTs
       * -------------------------- */}
      {listedNFTs.length > 0 && (
        <section className="w-full">
          <h2 className="dashboard-heading px-12 mt-6">Listed For Sale</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-12">
            {listedNFTs.map((n) => (
              <div
                className="max-w-sm rounded overflow-hidden shadow-lg dashboard-card"
                key={n.nftId}
                onClick={() => setSelectedNFT(n)}
              >
                <img src={n.image} alt="" className="w-full img" />
                <div className="px-6 py-4">
                  <h5 className="font-bold text-xl mb-2">{n.name}</h5>
                  <p className="text-white-700 text-base">{n.description}</p>
                  <p className="text-[gold] font-bold text-base mt-1">
                    Price: {n.price} {currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedNFT && (
        <Detail
          nft_data={selectedNFT}
          setshowDetail={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
}
