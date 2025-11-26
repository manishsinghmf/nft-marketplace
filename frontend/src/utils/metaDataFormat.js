import axios from "axios";
import { formatUnits, parseUnits } from "viem";
import { IPFS_CONFIG } from "../config/ipfsConfig";

export function mapformat(old_format) {
  let new_format = {}
  new_format.image = IPFS_CONFIG.GATEWAY + old_format.image;
  new_format.name = old_format.name;
  new_format.description = old_format.description;
  new_format.attributes = [
    {
      trait_type: "quantity",
      value: "",
    },
    {
      trait_type: "rarity",
      value: "",
    },
    {
      trait_type: "style",
      value: "",
    },
    {
      trait_type: "beauty",
      value: "",
    },
    {
      trait_type: "comedy",
      value: "",
    },
    {
      trait_type: "action",
      value: "",
    },
  ];

  for (let i = 0; i < new_format.attributes.length; i++) {
    new_format.attributes[i].value = old_format[new_format.attributes[i].trait_type]
  }

  let res = {
    "pinataMetadata": {
      name: old_format.name
    },
    "pinataContent": new_format
  }
  return res;

}

//Get NFT detail from URI
export async function getNFTDetailsFromURI(uri) {
  try {

    const response = await axios.get(uri);

    if (!response.status === 200) {
      console.error('Unable to fetch NFT metadata');
      return null;
    }

    return response.data;

  } catch (error) {
    console.error("Error in fetching nft details : ", error);
    return null;
  }
}

export const convertToEther = (value, decimals = 18) =>
  value ? formatUnits(BigInt(value), decimals) : "0";

export const convertToWei = (value, decimals = 18) =>
  parseUnits(value.toString(), decimals);

export const noExponents = (num) => {
  const data = String(num).split(/[eE]/);
  if (data.length === 1) return data[0];
  let z = "",
    sign = num < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;
  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
};
