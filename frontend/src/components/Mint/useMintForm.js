// src/components/Mint/useMintForm.js

import { useState } from "react";

export default function useMintForm() {
    const [nftImage, setNftImage] = useState(null);
    const [imageName, setImageName] = useState("");

    const [nftInfo, setNftInfo] = useState({
        name: "",
        description: "",
        quantity: 1,
        rarity: 1,
        style: 1,
        beauty: 1,
        comedy: 1,
        action: 1,
    });

    return {
        nftInfo,
        setNftInfo,
        nftImage,
        setNftImage,
        imageName,
        setImageName,
    };
}
