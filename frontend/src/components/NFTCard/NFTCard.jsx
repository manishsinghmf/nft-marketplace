import "./NFTCard.css";

export default function NFTCard({
    nft,
    currency,
    showMore = false,
    showPrice = false,
    onMore = null,
    ctaText = null,
    onCta = null,
}) {
    return (
        <div
            className="nft-card" key={nft.nftId}
        >
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
                        <button
                            className="more-link"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMore?.(nft);
                            }}
                        >
                            more details
                        </button>
                    </span>
                )}
            </div>

            {/* CTA BUTTON */}
            {ctaText && (
                <div className="px-6 pb-4">
                    <button
                        className="dashboard-sc-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCta?.(nft);
                        }}
                    >
                        {ctaText}
                    </button>
                </div>
            )}
        </div>
    );
}
