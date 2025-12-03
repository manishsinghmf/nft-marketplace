// ---------------------------------------------
// IMPORTANT: ALL MOCKS MUST COME BEFORE IMPORTS
// ---------------------------------------------

import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock axios BEFORE importing service
vi.mock("axios", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

// Mock metaDataFormat BEFORE ipfsService imports it dynamically
vi.mock("../../utils/metaDataFormat.js", () => ({
    mapformat: vi.fn((data) => ({
        pinataMetadata: { name: data.name },
        pinataContent: { ...data },
    })),
}));

// Mock ipfsConfig BEFORE anything loads
vi.mock("../../config/ipfsConfig.js", () => ({
    IPFS_CONFIG: {
        GATEWAY: "https://gateway.pinata.cloud/ipfs/",
        FILE_UPLOAD_URL: "https://pinata.test/uploadFile",
        JSON_UPLOAD_URL: "https://pinata.test/uploadJson",
        API_KEY: "test-key",
        API_SECRET: "test-secret",
    },
}));

// NOW IMPORT SERVICE (AFTER MOCKING EVERYTHING IT TOUCHES)
import axios from "axios";
import { IpfsService } from "../ipfsService";

// -----------------------
// TEST SUITE
// -----------------------
describe("IpfsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => { });
        vi.spyOn(console, "warn").mockImplementation(() => { });
    });

    /* -----------------------------
     * uploadFile()
     * ----------------------------*/
    describe("uploadFile", () => {
        it("uploads file and returns IPFS hash", async () => {
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: "QmTestFileHash" },
            });

            const file = new Blob(["hello"]);
            const res = await IpfsService.uploadFile(file);

            expect(res).toBe("QmTestFileHash");
            expect(axios.post).toHaveBeenCalledWith(
                "https://pinata.test/uploadFile",
                expect.any(FormData),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Content-Type": "multipart/form-data",
                        pinata_api_key: "test-key",
                        pinata_secret_api_key: "test-secret",
                    }),
                })
            );
        });

        it("returns null on upload error", async () => {
            axios.post.mockRejectedValueOnce(new Error("upload failed"));
            const res = await IpfsService.uploadFile(new Blob());
            expect(res).toBeNull();
        });
    });

    /* -----------------------------
     * uploadJSON()
     * ----------------------------*/
    describe("uploadJSON", () => {
        it("uploads JSON and returns hash", async () => {
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: "QmJsonHash" },
            });

            const res = await IpfsService.uploadJSON({ test: 1 });
            expect(res).toBe("QmJsonHash");
        });

        it("returns null on upload error", async () => {
            axios.post.mockRejectedValueOnce(new Error("json error"));
            const res = await IpfsService.uploadJSON({});
            expect(res).toBeNull();
        });
    });

    /* -----------------------------
     * uploadNFTMetadata()
     * ----------------------------*/
    describe("uploadNFTMetadata", () => {
        it("formats metadata and uploads JSON to IPFS", async () => {
            // JSON upload returns hash
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: "QmMetaHash" },
            });

            const formData = { name: "TestNFT", description: "desc" };
            const imageHash = "QmImageHash";

            const result = await IpfsService.uploadNFTMetadata(formData, imageHash);
            expect(result).toBe("QmMetaHash");

            // Check mapformat was called
            const { mapformat } = await import("../../utils/metaDataFormat.js");
            expect(mapformat).toHaveBeenCalledWith({
                ...formData,
                image: imageHash,
            });
        });

        it("returns null on failure", async () => {
            axios.post.mockRejectedValueOnce(new Error("upload failed"));

            const res = await IpfsService.uploadNFTMetadata({ name: "A" }, "hash");
            expect(res).toBeNull();
        });
    });

    /* -----------------------------
     * fetchMetadata()
     * ----------------------------*/
    describe("fetchMetadata", () => {
        it("returns metadata", async () => {
            const mockData = { name: "NFT", image: "ipfs://img" };
            axios.get.mockResolvedValueOnce({ data: mockData });

            const res = await IpfsService.fetchMetadata("https://meta/1");
            expect(res).toEqual(mockData);
        });

        it("returns null for missing uri", async () => {
            expect(await IpfsService.fetchMetadata(null)).toBeNull();
        });

        it("returns null on error", async () => {
            axios.get.mockRejectedValueOnce(new Error("bad"));

            const res = await IpfsService.fetchMetadata("https://bad");
            expect(res).toBeNull();
        });
    });
});
