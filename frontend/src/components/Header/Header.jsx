// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";

import "./Header.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Zustand & Wallet hooks
import useWallet from "../../hooks/useWallet";
import useAppStore from "../../store/useAppStore";
import { useModalStore } from "../../store/modalStore";

import { supportedChains } from "../../config/chains";

export default function Header() {
  const [openNav, setOpenNav] = useState(false);

  const { chainConfig } = useAppStore();
  const { setNetworkModalOpen } = useModalStore();
  const { address, isConnected, chainId, activeChain } = useWallet();

  // const networkSelected = activeChain.name;
  /** Update chain config automatically */
  useEffect(() => {
    if (!chainId) return;
    const chain = supportedChains.find((c) => c.id === chainId);
    if (chain) {
      useAppStore.setState({
        chainConfig: {
          id: chain.id,
          name: chain.name,
          currency: chain.nativeCurrency.symbol,
          explorerUrl: chain.blockExplorers?.default?.url || "",
        },
      });
    }
  }, [chainId]);

  const shortAddress =
    address && `${address.slice(0, 4)}...${address.slice(-4)}`;

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

  /** Auto close on desktop resize (same as old code) */
  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 960) setOpenNav(false);
    });
  }, []);

  return (
    <>
      <Navbar className="sticky bg-black text-white inset-0 z-10 h-max max-w-full rounded-none py-2 px-4 lg:px-8 lg:py-4">
        <div className="flex items-center justify-between">

          {/* === LOGO === */}
          <Link onClick={() => setOpenNav(false)} to="/">
            <img className="h-12 cursor-pointer" src={logo} alt="logo" />
          </Link>

          {/* === DESKTOP BUTTONS & MENU (same structure) === */}
          <div className="flex items-center gap-4">

            {/* Desktop Menu */}
            <div className="mr-4 hidden lg:block">{navList}</div>

            {/* {networkSelected && <Button
              variant="gradient"
              size="sm"
              className="connect-wallet-btn
                hidden lg:inline-block hover:text-black focus:text-black active:text-black"
            >
              {networkSelected}
            </Button>} */}
            {/* RainbowKit Desktop */}
            <div className="connect-wallet-btn hidden lg:inline-block">
              <ConnectButton
                showBalance={true}
                chainStatus="name"
                accountStatus={{ smallScreen: "full", largeScreen: "full" }}
              />
            </div>

            {/* Mobile Toggle Button (same structure as old code) */}
            <IconButton
              variant="text"
              className="ml-auto h-6 w-6 icon-btn text-inherit hover:bg-transparent lg:hidden"
              onClick={() => setOpenNav(!openNav)}
              ripple={false}
            >
              {openNav ? (
                <svg fill="none" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg fill="none" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </IconButton>
          </div>
        </div>

        <Collapse open={openNav} className="lg:hidden">

          <div>
            {/* Mobile Menu */}
            {navList}

            {/* RainbowKit Mobile */}
            <div className="connect-wallet-btn mb-2 w-full overflow-hidden">
              <ConnectButton
                showBalance={true}
                chainStatus="name"
                accountStatus={{ smallScreen: "full", largeScreen: "full" }}
              />
            </div>
          </div>
        </Collapse>
      </Navbar>
    </>
  );
}