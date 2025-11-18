// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";

import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Hooks & Stores
import useWallet from "../../hooks/useWallet";
import useAppStore from "../../store/useAppStore";
import { useModalStore } from "../../store/modalStore";

import { supportedChains } from "../../config/chains";

export default function Header() {
  const [openNav, setOpenNav] = useState(false);

  /** Zustand Stores */
  const { chainConfig } = useAppStore();
  const { setNetworkModalOpen } = useModalStore();

  /** Wallet Info */
  const { address, isConnected, chainId } = useWallet();

  /** Auto-update chainConfig when chain changes */
  useEffect(() => {
    if (!chainId) return;

    const currentChain = supportedChains.find((c) => c.id === chainId);
    if (currentChain) {
      // Let App.jsx update contracts; Header only updates UI config
      useAppStore.setState({
        chainConfig: {
          id: currentChain.id,
          name: currentChain.name,
          currency: currentChain.nativeCurrency.symbol,
          explorerUrl: currentChain.blockExplorers?.default?.url || "",
        },
      });
    }
  }, [chainId]);

  /** Short Address Utility */
  const shortAddress =
    address && `${address.slice(0, 4)}...${address.slice(-4)}`;

  /** NAV ITEMS */
  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {[
        { to: "/", label: "Dashboard" },
        { to: "/my-collection", label: "My Collection" },
        { to: "/mint", label: "Mint" },
        { to: "/buy", label: "Buy" },
        { to: "/sell", label: "Sell" },
      ].map((link) => (
        <Typography
          as="li"
          variant="small"
          className="p-1 font-normal"
          key={link.to}
        >
          <Link
            onClick={() => setOpenNav(false)}
            to={link.to}
            className="flex items-center text-base hover:text-[#ee82ee]"
          >
            <b>{link.label}</b>
          </Link>
        </Typography>
      ))}
    </ul>
  );

  /** Open Network Modal */
  const selectNetwork = () => {
    setOpenNav(false);
    setNetworkModalOpen(true);
  };

  /** Auto Close on Resize */
  useEffect(() => {
    const handleResize = () =>
      window.innerWidth >= 960 && setOpenNav(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Navbar className="sticky bg-black text-white inset-0 z-10 h-max max-w-full rounded-none py-2 px-4 lg:px-8 lg:py-4 border-none">
      <div className="flex items-center justify-between">

        {/* LOGO */}
        <Link onClick={() => setOpenNav(false)} to="/">
          <img src={logo} className="h-12 cursor-pointer" alt="logo" />
        </Link>

        {/* Desktop Nav + Connect Button */}
        <div className="flex items-center gap-4">
          <div className="mr-4 hidden lg:block">{navList}</div>

          {/* RainbowKit */}
          <div className="connect-wallet-btn">
            <ConnectButton
              showBalance={true}
              chainStatus="name"
              accountStatus={{
                smallScreen: "full",
                largeScreen: "full",
              }}
            />
          </div>

          {/* Mobile Menu Icon */}
          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {/* Mobile Menu */}
      <Collapse open={openNav}>
        {navList}

        {isConnected && (
          <>
            {/* Current Network */}
            <Button
              variant="gradient"
              size="sm"
              fullWidth
              className="connect-wallet-btn mb-2"
              onClick={selectNetwork}
            >
              {chainConfig?.name || "Select Network"}
            </Button>

            {/* Address Display */}
            <Button
              variant="gradient"
              size="sm"
              fullWidth
              className="connect-wallet-btn mb-2"
            >
              {shortAddress}
            </Button>
          </>
        )}

        {/* Mobile Connect Button */}
        <div className="mb-2 connect-wallet-btn">
          <ConnectButton chainStatus="icon" accountStatus="address" />
        </div>
      </Collapse>
    </Navbar>
  );
}
