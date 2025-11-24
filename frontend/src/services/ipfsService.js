// src/services/ipfsService.js
import axios from "axios";
import { IPFS_CONFIG } from "../config/ipfsConfig";


/**
 * Simple IPFS helpers using Pinata (same endpoints you had).
 * Adds fetchMetadata() which your ContractService expects.
 */
export const IpfsService = {
    async uploadFile(file) {
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await axios.post(IPFS_CONFIG.FILE_UPLOAD_URL, fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: IPFS_CONFIG.API_KEY,
                    pinata_secret_api_key: IPFS_CONFIG.API_SECRET,
                },
            });
            return res.data?.IpfsHash ?? null;
        } catch (err) {
            console.error("IpfsService.uploadFile error:", err);
            return null;
        }
    },

    async uploadJSON(json) {
        try {
            const res = await axios.post(IPFS_CONFIG.JSON_UPLOAD_URL, json, {
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: IPFS_CONFIG.API_KEY,
                    pinata_secret_api_key: IPFS_CONFIG.API_SECRET,
                },
            });
            return res.data?.IpfsHash ?? null;
        } catch (err) {
            console.error("IpfsService.uploadJSON error:", err);
            return null;
        }
    },

    async uploadNFTMetadata(formData, imageHash) {
        try {
            // dynamic import to reuse your existing mapping function
            const { mapformat } = await import("../utils/metaDataFormat.js");
            const metadata = mapformat({ ...formData, image: imageHash });
            const metaHash = await this.uploadJSON(metadata);
            return metaHash;
        } catch (err) {
            console.error("IpfsService.uploadNFTMetadata error:", err);
            return null;
        }
    },

    /**
     * Fetch metadata JSON from an arbitrary URI
     * - Accepts ipfs/http(s) URIs (we normalize gateways elsewhere)
     * - Returns parsed JSON or null
     */
    async fetchMetadata(uri) {
        if (!uri) return null;
        try {
            // If the user stored plain IPFS path, try to append configured gateway (best-effort)
            // But we assume uri is http(s) already — axios will handle it.
            const res = await axios.get(uri, { timeout: 12000 });
            return res.data ?? null;
        } catch (err) {
            console.warn("IpfsService.fetchMetadata failed for", uri, err?.message ?? err);
            return null;
        }
    },
};

export default IpfsService;
