import axios from "axios";
import {
  mapformat,
  getNFTDetailsFromURI,
  convertToEther,
  convertToWei,
  noExponents,
} from "../metaDataFormat";

jest.mock("axios");

jest.mock("../../config/ipfsConfig", () => ({
  IPFS_CONFIG: {
    GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  },
}));


describe("mapformat", () => {
  test("formats metadata correctly", () => {
    const input = {
      image: "QmHash",
      name: "Test NFT",
      description: "Cool NFT",
      quantity: "10",
      rarity: "rare",
      style: "modern",
      beauty: "high",
      comedy: "medium",
      action: "low",
    };

    const result = mapformat(input);

    expect(result.pinataContent.image).toBe(
      "https://gateway.pinata.cloud/ipfs/QmHash"
    );
    expect(result.pinataContent.name).toBe("Test NFT");
    expect(result.pinataContent.attributes).toHaveLength(6);
    expect(result.pinataMetadata.name).toBe("Test NFT");
  });
});

describe("getNFTDetailsFromURI", () => {
  test("returns metadata on success", async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { name: "NFT1" },
    });

    const result = await getNFTDetailsFromURI("https://example.com");

    expect(result).toEqual({ name: "NFT1" });
  });

  test("logs error and returns null on failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await getNFTDetailsFromURI("https://example.com");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("convertToEther", () => {
  test("converts wei to ether", () => {
    expect(convertToEther("1000000000000000000")).toBe("1");
  });

  test("returns 0 for null", () => {
    expect(convertToEther(null)).toBe("0");
  });
});

describe("convertToWei", () => {
  test("converts ether to wei", () => {
    expect(convertToWei("1").toString()).toBe("1000000000000000000");
  });
});

describe("noExponents", () => {
  test("returns number without exponent", () => {
    expect(noExponents(1e18)).toBe("1000000000000000000");
  });

  test("returns same string if no exponent", () => {
    expect(noExponents("5000")).toBe("5000");
  });
});
