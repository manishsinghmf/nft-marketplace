// src/components/Mint/MintForm.jsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { ALLOWED_IMAGE_FORMATS } from "../../utils/commonUtils";

export default function MintForm({
    nftInfo,
    setNftInfo,
    nftImage,
    setNftImage,
    imageName,
    setImageName,
}) {
    const ATTRIBUTE_FIELDS = [
        { key: "quantity", label: "Quantity", max: 100 },
        { key: "rarity", label: "Rarity", max: 10 },
        { key: "style", label: "Style", max: 10 },
        { key: "beauty", label: "Beauty", max: 10 },
        { key: "comedy", label: "Comedy", max: 10 },
        { key: "action", label: "Action", max: 10 },
    ];

    const handleInputNumber = (e) => {
        const { name, value } = e.target;

        if (value === "") {
            setNftInfo((p) => ({ ...p, [name]: "" }));
            return;
        }

        if (/^\d+$/.test(value)) {
            setNftInfo((p) => ({ ...p, [name]: Number(value) }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();
        if (!ALLOWED_IMAGE_FORMATS.includes(ext)) return;

        setNftImage(file);
        setImageName(file.name);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 form-background">
                <label className="uploadFile cursor-pointer">
                    <span className="filename">{imageName || "Choose Image"}</span>
                    <input type="file" accept="image/*" className="inputfile" onChange={handleImageChange} />
                    <span className="icon"><FontAwesomeIcon icon={faCloudArrowUp} /></span>
                </label>

                <input
                    type="text"
                    className="item-1 mt-5"
                    name="name"
                    value={nftInfo.name}
                    placeholder="NFT Name"
                    onChange={(e) => setNftInfo((p) => ({ ...p, name: e.target.value }))}
                />
            </div>

            <textarea
                className="form-control col-12 row-3 input-group text mt-5"
                placeholder="NFT Description"
                name="description"
                value={nftInfo.description}
                onChange={(e) => setNftInfo((p) => ({ ...p, description: e.target.value }))}
            />

            <br /><br />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {ATTRIBUTE_FIELDS.map((f) => (
                    <div className="text-center" key={f.key}>
                        <label>{f.label}</label>
                        <br />
                        <div className="mt-3">
                            <input
                                type="number"
                                className="form-control nft-input-rating"
                                name={f.key}
                                value={nftInfo[f.key]}
                                onChange={handleInputNumber}
                            />
                            <span className="text-[19px] mx-2">of</span>
                            <input className="form-control nft-input-rating" value={f.max} disabled />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
