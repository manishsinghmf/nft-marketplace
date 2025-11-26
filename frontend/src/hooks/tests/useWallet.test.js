// src/hooks/tests/useWallet.test.js
import useWallet from "../useWallet";
import { formatEther } from "viem";

// ---- Mock supportedChains ----
jest.mock("../../config/chains", () => ({
    supportedChains: [
        {
            id: 1,
            name: "Ethereum",
            nativeCurrency: { symbol: "ETH" },
            blockExplorers: { default: { url: "https://etherscan.io" } },
        },
        {
            id: 137,
            name: "Polygon",
            nativeCurrency: { symbol: "MATIC" },
            blockExplorers: { default: { url: "https://polygonscan.com" } },
        },
    ],
}));

// ---- Mock Wagmi hooks ----
const mockUseAccount = jest.fn();
const mockUseBalance = jest.fn();
const mockUseChainId = jest.fn();
const mockUseSwitchChain = jest.fn();
const mockUseDisconnect = jest.fn();

jest.mock("wagmi", () => ({
    useAccount: () => mockUseAccount(),
    useBalance: (args) => mockUseBalance(args),
    useChainId: () => mockUseChainId(),
    useSwitchChain: () => mockUseSwitchChain(),
    useDisconnect: () => mockUseDisconnect(),
}));

describe("useWallet()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns wallet data when connected", () => {
        mockUseAccount.mockReturnValue({
            address: "0xABC",
            status: "connected",
            isConnected: true,
        });

        mockUseChainId.mockReturnValue(1);

        mockUseBalance.mockReturnValue({
            data: { value: 1000000000000000000n, symbol: "ETH" },
            refetch: jest.fn(),
        });

        mockUseSwitchChain.mockReturnValue({
            switchChain: jest.fn(),
            isPending: false,
        });

        mockUseDisconnect.mockReturnValue({
            disconnect: jest.fn(),
        });

        const wallet = useWallet();

        expect(wallet.address).toBe("0xABC");
        expect(wallet.isConnected).toBe(true);
        expect(wallet.isDisconnected).toBe(false);

        expect(wallet.chainId).toBe(1);

        // active chain resolved from supportedChains
        expect(wallet.activeChain.name).toBe("Ethereum");

        // formatted balance
        expect(wallet.balance).toBe(formatEther(1000000000000000000n));
        expect(wallet.balanceSymbol).toBe("ETH");
    });

    test("returns zero balance when balanceData is null", () => {
        mockUseAccount.mockReturnValue({
            address: "0xDEF",
            status: "connected",
            isConnected: true,
        });

        mockUseChainId.mockReturnValue(137);

        mockUseBalance.mockReturnValue({
            data: null,
            refetch: jest.fn(),
        });

        mockUseSwitchChain.mockReturnValue({
            switchChain: jest.fn(),
            isPending: false,
        });

        mockUseDisconnect.mockReturnValue({
            disconnect: jest.fn(),
        });

        const wallet = useWallet();

        expect(wallet.balance).toBe("0");               // default
        expect(wallet.balanceSymbol).toBe("MATIC");     // native currency from chain config
    });

    test("handles disconnected wallet", () => {
        mockUseAccount.mockReturnValue({
            address: undefined,
            status: "disconnected",
            isConnected: false,
        });

        mockUseChainId.mockReturnValue(undefined);

        mockUseBalance.mockReturnValue({
            data: null,
            refetch: jest.fn(),
        });

        mockUseSwitchChain.mockReturnValue({
            switchChain: jest.fn(),
            isPending: false,
        });

        mockUseDisconnect.mockReturnValue({
            disconnect: jest.fn(),
        });

        const wallet = useWallet();

        expect(wallet.address).toBeUndefined();
        expect(wallet.isConnected).toBe(false);
        expect(wallet.isDisconnected).toBe(true);
        expect(wallet.activeChain).toBeUndefined();
        expect(wallet.balance).toBe("0");
        expect(wallet.balanceSymbol).toBe("ETH"); // fallback symbol
    });

    test("exposes switchChain & disconnect actions", () => {
        const mockSwitch = jest.fn();
        const mockDisconnect = jest.fn();

        mockUseAccount.mockReturnValue({
            address: "0xAAA",
            status: "connected",
            isConnected: true,
        });

        mockUseChainId.mockReturnValue(1);
        mockUseBalance.mockReturnValue({ data: null, refetch: jest.fn() });

        mockUseSwitchChain.mockReturnValue({
            switchChain: mockSwitch,
            isPending: true,
        });

        mockUseDisconnect.mockReturnValue({
            disconnect: mockDisconnect,
        });

        const wallet = useWallet();

        expect(wallet.switchChain).toBe(mockSwitch);
        expect(wallet.isSwitchingChain).toBe(true);
        expect(wallet.disconnect).toBe(mockDisconnect);
    });
});
