import "./Mint.css";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import { useMemo } from "react";

import MintForm from "./MintForm";
import useMintTx from "../../hooks/useMintTx";
import { CONTRACTS } from "../../config/contracts";

export default function Mint() {

  console.log("Mint Render")
  const { chainId, isConnected, address } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData } = useBalance({ address });

  // const chainConfig = CONTRACTS[chainId];
  const chainConfig = useMemo(() => CONTRACTS[chainId], [chainId]);
  const mintParams = useMemo(() => ({
    chainConfig,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
  }), [
    chainConfig,
    chainId,
    address,
    publicClient,
    walletClient,
    balanceData,
  ]);

  const { mint } = useMintTx(mintParams);
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

          <MintForm onSubmit={mint} />
        </div>
      </div>
    </div>
  );
}
