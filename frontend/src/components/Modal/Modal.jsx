// src/components/Modal/Modal.jsx

import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";
import RingLoader from "react-spinners/RingLoader";
import { useModalStore } from "../../store/modalStore";

export default function Modal() {
  const {
    modal: { open, heading, description, loading, actionText, onAction },
    closeModal,
  } = useModalStore();

  // If modal is not open, do not render anything
  if (!open) return null;

  // Get the portal target
  const modalRoot = document.getElementById("modal-root");
  // SAFETY CHECK — prevents "Target container is not a DOM element" error
  if (!modalRoot) {
    console.warn("Modal root not found: #modal-root missing in index.html");
    return null;
  }

  const content = (
    <>
      {/* Background overlay */}
      <div className="darkBG" onClick={() => closeModal()} />

      <div className="centered">
        <div className="modal">

          <div className="modalHeader">
            <h3 className="heading">{heading}</h3>
          </div>

          <button className="closeBtn" onClick={() => closeModal()}>
            X
          </button>

          <hr />

          {/* LOADING SPINNER */}
          {!loading && (
            <div className="py-8 inline-block w-full text-center">
              <RingLoader
                color={"rgba(54, 215, 183, 1)"}
                loading={true}
                size={40}
              />
            </div>
          )}

          {/* TEXT CONTENT */}
          <div
            className={
              !loading
                ? "w-full modalContent top-2/3"
                : "w-full modalContent inset-y-1/2 bottom-4"
            }
          >
            <p
              className="break-words"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="modalActions">
            <div className="actionsContainer">
              {loading && (
                <button
                  className="deleteBtn"
                  onClick={() => {
                    if (typeof onAction === "function") onAction();
                    closeModal();
                  }}
                >
                  <b>{actionText || "OK"}</b>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ✔ Render modal into portal root
  return ReactDOM.createPortal(content, modalRoot);
}
