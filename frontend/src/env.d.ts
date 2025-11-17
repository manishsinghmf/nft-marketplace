/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REACT_APP_PINATA_API_KEY: string;
    readonly VITE_REACT_APP_PINATA_SECRET_KEY?: string;
    readonly VITE_NETWORK?: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
    // add more as needed...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
