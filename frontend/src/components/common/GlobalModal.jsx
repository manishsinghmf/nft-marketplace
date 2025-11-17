// src/components/common/GlobalModal.jsx
import React from "react";
import { useModalStore } from "../../store/modalStore";

export default function GlobalModal() {
    const { modal, closeModal } = useModalStore();

    if (!modal.open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">

                {/* Heading */}
                {modal.heading && (
                    <h2 className="modal-heading">{modal.heading}</h2>
                )}

                {/* Description */}
                <div
                    className="modal-description"
                    dangerouslySetInnerHTML={{
                        __html: modal.description || ""
                    }}
                />

                {/* Button */}
                <div className="modal-actions">
                    {modal.buttonEnabled && (
                        <button
                            className="modal-button"
                            onClick={() => {
                                if (modal.onAction) modal.onAction();
                                closeModal();
                            }}
                        >
                            {modal.actionText || "OK"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
