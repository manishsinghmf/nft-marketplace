// src/components/Mint/Mint.jsx
import "./Mint.css";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";

import MintForm from "./MintForm";
import useMintForm from "./useMintForm";
import useMintActions from "./useMintActions";

import { CONTRACTS } from "../../config/contracts";

export default function Mint() {
  const {
    nftInfo,
    setNftInfo,
    nftImage,
    setNftImage,
    imageName,
    setImageName,
  } = useMintForm();

  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData } = useBalance({ address });

  const chainConfig = CONTRACTS[chainId];

  const resetForm = () => {
    setNftInfo({
      name: "",
      description: "",
      quantity: 1,
      rarity: 1,
      style: 1,
      beauty: 1,
      comedy: 1,
      action: 1,
    });
    setNftImage(null);
    setImageName("");
  };

  const { mint } = useMintActions({
    nftInfo,
    nftImage,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
    chainConfig,
    resetForm,
  });

  if (!isConnected)
    return <div className="text-center text-red-400 mt-10">Please connect wallet.</div>;

  if (!chainConfig)
    return <div className="text-center text-red-400 mt-10">Unsupported network.</div>;

  return (
    <div className="create-item-container">
      <div className="form-create-item-content">
        <div className="form-create-item">
          <h1 className="main-heading">Create NFT</h1>
          <p>Most popular NFT marketplace for celebrities</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mint();
            }}
          >
            <MintForm
              nftInfo={nftInfo}
              setNftInfo={setNftInfo}
              nftImage={nftImage}
              setNftImage={setNftImage}
              imageName={imageName}
              setImageName={setImageName}
            />

            <div className="text-center mt-10">
              <button type="submit" className="sc-button">
                Mint NFT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
