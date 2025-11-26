export default {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },

  moduleFileExtensions: ["js", "jsx", "json", "mjs"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // 🟢 CRITICAL FIX: Allow wagmi & viem to be transformed
  transformIgnorePatterns: [
    "node_modules/(?!(wagmi|viem|@wagmi|@tanstack/query-core)/)"
  ],

  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/**/index.js",
    "!src/**/*.test.{js,jsx}",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov", "text-summary"],

  // Minimum % required to pass CI
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },

  // Silence react-router and viem noisy warnings
  testEnvironmentOptions: {
    customExportConditions: ["react-server", "browser", "development"],
  },
};
