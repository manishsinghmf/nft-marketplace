import { TextEncoder, TextDecoder } from "util";
import { webcrypto } from "crypto";

global.importMeta = {
    env: {
        VITE_NETWORK: "test-network",
        VITE_WALLETCONNECT_PROJECT_ID: "mock-project-id",
        VITE_PINATA_SECRET_KEY: "mock-secret-key",
        VITE_PINATA_API_KEY: "mock-api-key",
        VITE_PINATA_GATEWAY: "mock-gateway",
        VITE_PINATA_JSON_URL: "mock-json-url",
        VITE_PINATA_FILE_URL: "mock-file-url"
    }
};

// Required by react-router, viem, wagmi
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Required for viem hashing functions
if (!global.crypto) global.crypto = webcrypto;

jest.mock("zustand/react", () => ({
    useStore: () => { }
}));

jest.mock("zustand", () => require("zustand/vanilla"));
