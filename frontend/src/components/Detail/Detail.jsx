import "./Detail.css";

export default function Detail({ nft_data, setshowDetail }) {
  const metadata = nft_data;

  if (!metadata) return null;

  const {
    nftId,
    name,
    description,
    image,
    attributes = [],
    price,
    amount,
    uri,
  } = metadata;

  return (
    <div className="overlay" id="popup">
      <div className="popup">
        <h2 className="text-2xl font-bold mb-4 text-center">
          NFT Metadata Details
        </h2>
        <hr />
        <br />

        {/* IMAGE */}
        {image && (
          <div className="mb-4 w-full flex justify-center">
            <img src={image} alt={name} className="detail-img-preview" />
          </div>
        )}

        {/* TOKEN ID */}
        <div className="mb-4 param">
          <strong className="param">TOKEN ID :</strong> {nftId}
        </div>

        {/* PRICE (if listed) */}
        {price !== null && price !== undefined && (
          <div className="mb-4 param text-[gold]">
            <strong className="param">PRICE :</strong> {price}
          </div>
        )}

        {/* QUANTITY */}
        {amount !== undefined && (
          <div className="mb-4 param">
            <strong className="param">QUANTITY :</strong> {amount}
          </div>
        )}

        {/* NAME */}
        <div className="mb-4 param">
          <strong className="param">NAME :</strong> {name}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4 param">
          <strong className="param">DESCRIPTION :</strong> {description}
        </div>

        {/* ATTRIBUTES */}
        {attributes?.length > 0 &&
          attributes.map((attr, index) => (
            <div className="mb-4 param" key={index}>
              <strong className="param">{attr.trait_type.toUpperCase()} :</strong>{" "}
              {attr.value}
            </div>
          ))}

        {/* METADATA URL */}
        {uri && (
          <div className="mb-4 param break-all">
            <strong className="param">Metadata URL : </strong>
            <a
              className="break-words text-[#0000EE] underline"
              href={uri}
              target="_blank"
              rel="noreferrer"
            >
              {uri}
            </a>
          </div>
        )}

        {/* CLOSE BUTTON */}
        <div className="flex justify-end">
          <button
            className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded button"
            onClick={() => setshowDetail(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
