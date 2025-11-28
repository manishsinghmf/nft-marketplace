import React from "react";
import image from "../../assets/robo.png";
import "./Home.css";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="Home h-screen bg-[#0a0a0a] text-white">
      <div className="grid md:grid-cols-2 gap-3 items-center p-8">
        <div>
          <h1 className="font-bold text-4xl md:text-6xl leading-tight">
            Discover and collect your favourite digital NFTs
          </h1>
          <br />
          {/* <div className="rainbow-connect-wallet">
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div> */}
        </div>

        <div className="flex justify-center">
          <img className="h-[90%] max-h-[600px]" src={image} alt="NFT Robot" />
        </div>
      </div>
    </div>
  );
}
