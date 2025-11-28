import React, { useCallback } from "react";
import "./NFTCard.css";

function NFTCard({
    nft,
    currency,
    showMore = false,
    showPrice = false,
    onMore,
    ctaText,
    onCta,
}) {

    // Stable handlers (prevents re-renders)
    const handleMore = useCallback(
        (e) => {
            e.stopPropagation();
            onMore?.(nft);
        },
        [onMore, nft]
    );

    const handleCta = useCallback(
        (e) => {
            e.stopPropagation();
            onCta?.(nft);
        },
        [onCta, nft]
    );

    return (
        <div className="nft-card">
            {/* IMAGE */}
            <div className="nft-image-wrapper">
                <img src={nft.image} alt={nft.name} className="nft-image" />
            </div>

            {/* CONTENT */}
            <div className="px-6 py-4">
                <h5 className="font-bold text-xl mb-2">{nft.name}</h5>
                <p className="text-gray-300 text-base">{nft.description}</p>

                {/* PRICE */}
                {showPrice && nft.price !== undefined && (
                    <p className="text-[gold] font-bold text-base mt-1">
                        Price: {nft.price} {currency}
                    </p>
                )}

                {/* MORE DETAILS */}
                {showMore && (
                    <span className="icon">
                        <button className="more-link" onClick={handleMore}>
                            more details
                        </button>
                    </span>
                )}
            </div>

            {/* CTA BUTTON */}
            {ctaText && (
                <div className="px-6 pb-4">
                    <button className="dashboard-sc-button" onClick={handleCta}>
                        {ctaText}
                    </button>
                </div>
            )}
        </div>
    );
}

// 🧊 Freeze component unless props change
export default React.memo(NFTCard);
