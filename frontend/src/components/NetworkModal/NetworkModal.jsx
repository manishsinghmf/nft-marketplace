// src/components/NetworkModal/NetworkModal.jsx
import React from "react";
import "./NetworkModal.css";

import { useSwitchChain, useAccount, useChainId } from "wagmi";
import { supportedChains } from "../../config/chains";

import { useModalStore } from "../../store/modalStore";

export default function NetworkModal({ setIsNetworkModalOpen }) {
    const close = () => setIsNetworkModalOpen(false);

    const { switchChain, isPending } = useSwitchChain();
    const { isConnected } = useAccount();
    const currentChainId = useChainId();

    const openModal = useModalStore((s) => s.openModal);

    const chooseNetwork = async (chain) => {
        try {
            if (!isConnected) {
                openModal({
                    heading: "Wallet Not Connected",
                    description: "Please connect your wallet first.",
                    loading: false,
                });
                close();
                return;
            }

            switchChain({ chainId: chain.id });
            close();

        } catch (err) {
            console.error("Network switch error:", err);

            openModal({
                heading: "Network Switch Failed",
                description: err?.message || "Could not switch network.",
                loading: false,
            });

            close();
        }
    };

    return (
        <>
            <div className="network-darkBG" onClick={close} />

            <div className="network-centered">
                <div className="network-modal">

                    <div className="network-modalHeader">
                        <h3 className="network-heading">Select Network</h3>
                    </div>

                    <button className="network-closeBtn" onClick={close}>
                        X
                    </button>

                    <hr />

                    <div className="network-modalContent">
                        {supportedChains.map((chain) => {
                            const isActive = currentChainId === chain.id;

                            return (
                                <div
                                    key={chain.id}
                                    className={`network-name ${isActive ? "active-network" : ""}`}
                                    onClick={() => chooseNetwork(chain)}
                                >
                                    {chain.name} {isActive ? "(Active)" : ""}
                                </div>
                            );
                        })}
                    </div>

                    {isPending && (
                        <p className="text-center text-sm text-gray-400 mt-3">
                            Switching network...
                        </p>
                    )}

                </div>
            </div>
        </>
    );
}
