// src/components/Detail/Detail.jsx
import React from "react";
import ReactDOM from "react-dom";
import "./Detail.css";

export default function Detail({ nft_data, setshowDetail }) {
  if (!nft_data) return null;

  const portalRoot = document.getElementById("modal-root");
  if (!portalRoot) return null;

  const {
    nftId,
    name,
    description,
    image,
    attributes = [],
    price,
    amount,
    uri,
  } = nft_data;

  const close = () => setshowDetail(false);

  const content = (
    <>
      {/* Background overlay */}
      <div className="overlay-bg" onClick={close} />

      {/* Modal wrapper centers the popup */}
      <div className="modal-wrapper" role="dialog" aria-modal="true" aria-label="NFT details">
        <div className="popup">
          <h2 className="popup-heading">NFT Metadata Details</h2>
          <hr />

          {/* SCROLLABLE SECTION */}
          <div className="popup-content">
            {image && (
              <div className="image-wrap">
                <img src={image} alt={name} className="detail-img-preview" />
              </div>
            )}

            <div className="mb-4 param">
              <strong className="param">TOKEN ID :</strong> {nftId}
            </div>

            {price != null && (
              <div className="mb-4 param price-text">
                <strong className="param">PRICE :</strong> {price}
              </div>
            )}

            {amount != null && (
              <div className="mb-4 param">
                <strong className="param">QUANTITY :</strong> {amount}
              </div>
            )}

            <div className="mb-4 param">
              <strong className="param">NAME :</strong> {name}
            </div>

            <div className="mb-4 param">
              <strong className="param">DESCRIPTION :</strong> {description}
            </div>

            {attributes.length > 0 &&
              attributes.map((attr, index) => (
                <div className="mb-4 param" key={index}>
                  <strong className="param">{attr.trait_type.toUpperCase()} :</strong>{" "}
                  {attr.value}
                </div>
              ))}

            {uri && (
              <div className="mb-4 param break-all">
                <strong className="param">Metadata URL : </strong>
                <a
                  className="break-words link"
                  href={uri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {uri}
                </a>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="popup-footer">
            <button
              className="btn-close"
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(content, portalRoot);
}
