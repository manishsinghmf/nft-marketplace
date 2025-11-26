import { IpfsService } from "../ipfsService";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock IPFS_CONFIG
jest.mock("../../config/ipfsConfig", () => ({
    IPFS_CONFIG: {
        FILE_UPLOAD_URL: "https://pinata.test/uploadFile",
        JSON_UPLOAD_URL: "https://pinata.test/uploadJson",
        API_KEY: "test-key",
        API_SECRET: "test-secret",
    },
}));

// Mock dynamic import of metaDataFormat.js
jest.mock("../../utils/metaDataFormat.js", () => ({
    mapformat: jest.fn((data) => ({
        pinataMetadata: { name: data.name },
        pinataContent: { ...data },
    })),
}));

describe("IpfsService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
        jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    /* -----------------------------
     * uploadFile()
     * ----------------------------*/
    describe("uploadFile", () => {
        it("uploads file and returns IPFS hash", async () => {
            const mockHash = "QmTestFileHash";
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: mockHash },
            });

            const file = new Blob(["hello"]);
            const res = await IpfsService.uploadFile(file);

            expect(res).toBe(mockHash);
            expect(axios.post).toHaveBeenCalledTimes(1);
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
            const mockHash = "QmJsonHash";
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: mockHash },
            });

            const json = { name: "Test JSON" };
            const res = await IpfsService.uploadJSON(json);

            expect(res).toBe(mockHash);
            expect(axios.post).toHaveBeenCalledWith(
                "https://pinata.test/uploadJson",
                json,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        pinata_api_key: "test-key",
                        pinata_secret_api_key: "test-secret",
                    }),
                })
            );
        });

        it("returns null on upload error", async () => {
            axios.post.mockRejectedValueOnce(new Error("upload-json error"));
            const res = await IpfsService.uploadJSON({});
            expect(res).toBeNull();
        });
    });

    /* -----------------------------
     * uploadNFTMetadata()
     * ----------------------------*/
    describe("uploadNFTMetadata", () => {
        it("formats metadata and uploads JSON to IPFS", async () => {
            const mockHash = "QmMetaHash";

            // axios post for uploadJSON
            axios.post.mockResolvedValueOnce({
                data: { IpfsHash: mockHash },
            });

            const formData = { name: "TestNFT", description: "desc" };
            const imageHash = "QmImageHash";

            const result = await IpfsService.uploadNFTMetadata(formData, imageHash);

            expect(result).toBe(mockHash);

            // verify mapformat was called with merged data
            const { mapformat } = require("../../utils/metaDataFormat.js");
            expect(mapformat).toHaveBeenCalledWith({
                ...formData,
                image: imageHash,
            });
        });

        it("returns null if something fails", async () => {
            axios.post.mockRejectedValueOnce(new Error("json upload failed"));
            const res = await IpfsService.uploadNFTMetadata({ name: "A" }, "hash");
            expect(res).toBeNull();
        });
    });

    /* -----------------------------
     * fetchMetadata()
     * ----------------------------*/
    describe("fetchMetadata", () => {
        it("fetches metadata successfully", async () => {
            const metadata = { name: "NFT", image: "ipfs://img" };
            axios.get.mockResolvedValueOnce({ data: metadata });

            const res = await IpfsService.fetchMetadata("https://meta/1");
            expect(res).toEqual(metadata);
            expect(axios.get).toHaveBeenCalledWith("https://meta/1", { timeout: 12000 });
        });

        it("returns null for missing uri", async () => {
            const res = await IpfsService.fetchMetadata(null);
            expect(res).toBeNull();
        });

        it("returns null when fetch fails", async () => {
            axios.get.mockRejectedValueOnce(new Error("fetch fail"));

            const res = await IpfsService.fetchMetadata("https://bad");
            expect(res).toBeNull();
        });
    });
});
