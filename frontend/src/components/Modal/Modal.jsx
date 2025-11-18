// src/components/Modal/Modal.jsx

import React from "react";
import "./Modal.css";
import RingLoader from "react-spinners/RingLoader";
import { useModalStore } from "../../store/modalStore";

export default function Modal() {
  const {
    modal: { open, heading, description, loading, actionText, onAction },
    closeModal,
  } = useModalStore();

  if (!open) return null;

  const handleBackgroundClick = () => closeModal();

  const handleButtonClick = () => {
    if (typeof onAction === "function") onAction();
    closeModal();
  };

  return (
    <>
      <div className="darkBG" onClick={handleBackgroundClick} />

      <div className="centered">
        <div className="modal">

          <div className="modalHeader">
            <h3 className="heading">{heading}</h3>
          </div>

          <button className="closeBtn" onClick={handleBackgroundClick}>
            X
          </button>

          <hr />

          {!loading && (
            <div className="py-8 inline-block w-full text-center">
              <RingLoader
                color={"rgba(54, 215, 183, 1)"}
                loading={true}
                size={40}
              />
            </div>
          )}

          <div
            className={
              !loading
                ? "w-full modalContent top-2/3"
                : "w-full modalContent inset-y-1/2 bottom-4"
            }
          >
            <p
              className="break-words" style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          <div className="modalActions">
            <div className="actionsContainer">
              {loading && (
                <button className="deleteBtn" onClick={handleButtonClick}>
                  <b>{actionText || "OK"}</b>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
