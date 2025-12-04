import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Import functions
import {
  mapformat,
  getNFTDetailsFromURI,
  convertToEther,
  convertToWei,
  noExponents,
} from "../../utils/metaDataFormat";

// --- Mock axios ---
vi.mock("axios");

vi.mock("../../config/ipfsConfig", () => ({
  IPFS_CONFIG: {
    GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  },
}));


describe("mapformat", () => {
  it("correctly maps old format to new Pinata upload format", () => {
    const old_format = {
      name: "Test NFT",
      description: "Cool NFT",
      image: "Qm12345",
      quantity: 10,
      rarity: 5,
      style: 3,
      beauty: 2,
      comedy: 7,
      action: 1,
    };

    const result = mapformat(old_format);

    expect(result).toEqual({
      pinataMetadata: {
        name: "Test NFT",
      },
      pinataContent: {
        image: "https://gateway.pinata.cloud/ipfs/Qm12345",
        name: "Test NFT",
        description: "Cool NFT",
        attributes: [
          { trait_type: "quantity", value: 10 },
          { trait_type: "rarity", value: 5 },
          { trait_type: "style", value: 3 },
          { trait_type: "beauty", value: 2 },
          { trait_type: "comedy", value: 7 },
          { trait_type: "action", value: 1 },
        ],
      },
    });
  });
});

describe("getNFTDetailsFromURI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns metadata when axios returns 200", async () => {
    const mockData = { name: "NFT A" };

    axios.get.mockResolvedValueOnce({
      status: 200,
      data: mockData,
    });

    const result = await getNFTDetailsFromURI("https://test.com/metadata.json");

    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith("https://test.com/metadata.json");
  });

  it("returns null when status is not 200", async () => {
    axios.get.mockResolvedValueOnce({
      status: 404,
      data: null,
    });

    const result = await getNFTDetailsFromURI("https://bad-url");
    expect(result).toBeNull();
  });

  it("returns null and logs error on axios failure", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await getNFTDetailsFromURI("https://bad-url");
    expect(result).toBeNull();
  });
});

describe("convertToEther", () => {
  it("converts wei to ether correctly", () => {
    // 1 ETH in Wei
    const value = "1000000000000000000";
    const result = convertToEther(value);

    expect(result).toBe("1");
  });

  it("returns '0' for falsy input", () => {
    expect(convertToEther(null)).toBe("0");
    expect(convertToEther("")).toBe("0");
  });
});

describe("convertToWei", () => {
  it("converts ether string to wei bigint", () => {
    const result = convertToWei("1"); // 1 ETH
    expect(result).toBe(1000000000000000000n);
  });

  it("supports custom decimals", () => {
    const result = convertToWei("1", 6); // 1 USDC
    expect(result).toBe(1000000n);
  });
});

describe("noExponents", () => {
  it("returns input when no exponent is present", () => {
    expect(noExponents(12345)).toBe("12345");
  });

  it("correctly handles small exponent numbers", () => {
    expect(noExponents(1e-5)).toBe("0.00001");
  });

  it("handles large exponent numbers", () => {
    expect(noExponents(1e6)).toBe("1000000");
  });

  it("works with negative exponent numbers", () => {
    expect(noExponents(5e-7)).toBe("0.0000005");
  });
});
