/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            "@": "/src",
            "@/": "/src/",
            "src/hooks/useContract": "/src/tests/mocks/useContract.js",
            "src/config/contracts": "/src/tests/mocks/contracts.js",
            "src/config/ipfsConfig": "/src/tests/mocks/ipfsConfig.js",
            "src/config/contractFunctions": "/src/tests/mocks/contractFunctions.js",
            "src/services/ipfsService": "/src/tests/mocks/ipfsService.js",
            "src/services/contractService": "/src/tests/mocks/contractService.js",
            "src/services/gasService": "/src/tests/mocks/gasService.js",
            "src/services/balanceService": "/src/tests/mocks/balanceService.js",
        },
        extensions: [".js", ".jsx", ".json"],
    },

    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
        css: true,

        deps: {
            inline: [
                "src/services/contractService",
                "src/services/ipfsService",
                "src/services/gasService",
                "src/services/balanceService",
                "src/config/contracts",
                "src/config/contractFunctions",
                "src/config/ipfsConfig",
                "src/store/modalStore",
            ],
        },

        mockReset: true,

        coverage: {
            provider: "v8",
            reportsDirectory: "coverage",
            reporter: ["text", "html", "lcov", "text-summary"],

            // THIS IS WHAT YOU ARE MISSING
            all: true,
            include: ["src/**/*.{js,jsx}"],
            exclude: [
                "src/**/*.css",
                "src/tests/mocks/**",
            ],

            thresholds: {
                statements: 80,
                branches: 70,
                functions: 80,
                lines: 80,
            },
        }
    }
});
