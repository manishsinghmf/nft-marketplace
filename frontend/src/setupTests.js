import '@testing-library/jest-dom';

Object.defineProperty(import.meta, "env", {
    value: {
        VITE_PINATA_GATEWAY: "https://testing.gateway/",
        VITE_PINATA_FILE_URL: "https://testing/uploadFile",
        VITE_PINATA_JSON_URL: "https://testing/uploadJson",
        VITE_PINATA_API_KEY: "test-key",
        VITE_PINATA_SECRET_KEY: "test-secret",
    },
});
