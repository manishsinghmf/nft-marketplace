/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PINATA_API_KEY: string;
    readonly VITE_PINATA_SECRET_KEY?: string;
    readonly VITE_NETWORK?: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
    readonly VITE_PINATA_GATEWAY?: string;
    readonly VITE_PINATA_JSON_URL?: string;
    readonly VITE_PINATA_FILE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
