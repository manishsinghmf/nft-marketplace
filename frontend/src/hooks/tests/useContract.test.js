// src/hooks/tests/useContract.test.js
import {
    getContract,
    default as useContract,
    readFromContract,
    writeToContract,
    useReadFromContract,
    useWriteToContract,
} from "../useContract";

jest.mock("../../config/contracts", () => ({
    CONTRACTS: {
        1: {
            name: "TestNet",
            nft: { address: "0xNFT", abi: ["abiNft"] },
            marketplace: { address: "0xMARKET", abi: ["abiMarket"] },
        },
        2: {
            name: "OtherNet",
            // intentionally missing nft/marketplace to test negative cases
        },
    },
}));

// Mock wagmi exports used by the hook file
const mockUsePublicClient = jest.fn();
const mockUseWalletClient = jest.fn();
const mockWagmiRead = jest.fn();
const mockWagmiWrite = jest.fn();

jest.mock("wagmi", () => ({
    usePublicClient: () => mockUsePublicClient(),
    useWalletClient: () => mockUseWalletClient(),
    useReadContract: (...args) => mockWagmiRead(...args),
    useWriteContract: (...args) => mockWagmiWrite(...args),
}));

describe("useContract hooks and helpers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    describe("getContract()", () => {
        it("returns null for invalid chainId", () => {
            expect(getContract(null, "nft")).toBeNull();
            expect(getContract(undefined, "nft")).toBeNull();
        });

        it("returns null when chain exists but contract name missing", () => {
            expect(getContract(2, "nft")).toBeNull();
        });

        it("returns contract object for valid chain and name", () => {
            const c = getContract(1, "nft");
            expect(c).toEqual({ address: "0xNFT", abi: ["abiNft"] });
        });
    });

    describe("useContract() (reads wagmi hooks)", () => {
        it("returns clients and configured contracts", () => {
            // mock wagmi hooks to return sentinel values
            mockUsePublicClient.mockReturnValueOnce({ name: "publicClient" });
            mockUseWalletClient.mockReturnValueOnce({ data: { name: "walletClient" } });


            // call the default exported function (it's not a React hook here because our mocks are simple functions)
            const result = useContract(1);

            expect(result.publicClient).toEqual({ name: "publicClient" });
            expect(result.walletClient).toEqual({ name: "walletClient" });
            expect(result.nftContract).toEqual({ address: "0xNFT", abi: ["abiNft"] });
            expect(result.marketplaceContract).toEqual({ address: "0xMARKET", abi: ["abiMarket"] });
        });

        it("returns null contracts when chain not found", () => {
            mockUsePublicClient.mockReturnValueOnce({ name: "pub" });
            mockUseWalletClient.mockReturnValueOnce({ data: "wallet" });

            const result = useContract(999);
            expect(result.nftContract).toBeNull();
            expect(result.marketplaceContract).toBeNull();
        });
    });

    describe("readFromContract()", () => {
        it("reads contract and returns { data, error: null } on success", async () => {
            const fakeClient = { readContract: jest.fn().mockResolvedValue("READ_RESULT") };

            const res = await readFromContract({
                chainId: 1,
                contractName: "nft",
                functionName: "someFn",
                client: fakeClient,
                args: ["a", "b"],
                account: "0xUser",
            });

            expect(fakeClient.readContract).toHaveBeenCalledWith({
                address: "0xNFT",
                abi: ["abiNft"],
                functionName: "someFn",
                args: ["a", "b"],
                account: "0xUser",
            });

            expect(res).toEqual({ data: "READ_RESULT", error: null });
        });

        it("returns { data: null, error } when contract not configured", async () => {
            const res = await readFromContract({
                chainId: 999,
                contractName: "nft",
                functionName: "f",
                client: { readContract: jest.fn() },
            });

            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.error.message).toMatch(/Contract not configured/i);
        });

        it("returns { data: null, error } when client missing", async () => {
            // client missing
            const res = await readFromContract({
                chainId: 1,
                contractName: "nft",
                functionName: "f",
                client: null,
            });

            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.error.message).toMatch(/Public client required/i);
        });

        it("returns error when client.readContract throws", async () => {
            const badClient = { readContract: jest.fn().mockRejectedValue(new Error("rpc fail")) };

            const res = await readFromContract({
                chainId: 1,
                contractName: "nft",
                functionName: "f",
                client: badClient,
            });

            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.error.message).toMatch(/rpc fail/);
        });
    });

    describe("writeToContract()", () => {
        it("writes contract and returns hash on success", async () => {
            const fakeWalletClient = { writeContract: jest.fn().mockResolvedValue("0xHASH") };

            const res = await writeToContract({
                chainId: 1,
                contractName: "marketplace",
                functionName: "doThing",
                walletClient: fakeWalletClient,
                args: [1, 2],
                value: 100n,
            });

            expect(fakeWalletClient.writeContract).toHaveBeenCalledWith({
                address: "0xMARKET",
                abi: ["abiMarket"],
                functionName: "doThing",
                args: [1, 2],
                value: 100n,
            });

            expect(res).toEqual({ hash: "0xHASH", error: null });
        });

        it("returns error when walletClient missing", async () => {
            const res = await writeToContract({
                chainId: 1,
                contractName: "marketplace",
                functionName: "doThing",
                walletClient: null,
            });

            expect(res.data).toBeUndefined();
            expect(res.hash).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.error.message).toMatch(/Wallet client required/i);
        });

        it("returns error when walletClient.writeContract throws", async () => {
            const badWalletClient = { writeContract: jest.fn().mockRejectedValue(new Error("tx fail")) };

            const res = await writeToContract({
                chainId: 1,
                contractName: "marketplace",
                functionName: "doThing",
                walletClient: badWalletClient,
            });

            expect(res.hash).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.error.message).toMatch(/tx fail/);
        });
    });

    describe("useReadFromContract and useWriteToContract wrappers", () => {
        it("useReadFromContract calls wagmi read wrapper when contract exists", () => {
            const wagmiReturn = { data: "wagmiData", isError: false };
            mockWagmiRead.mockReturnValueOnce(wagmiReturn);

            const res = useReadFromContract({ chainId: 1, contractName: "nft", functionName: "fn", args: [] });
            expect(mockWagmiRead).toHaveBeenCalledWith({
                address: "0xNFT",
                abi: ["abiNft"],
                functionName: "fn",
                args: [],
                watch: false,
            });
            expect(res).toBe(wagmiReturn);
        });

        it("useReadFromContract returns error object when contract missing", () => {
            const res = useReadFromContract({ chainId: 999, contractName: "nft", functionName: "fn", args: [] });
            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
            expect(res.isError).toBe(true);
        });

        it("useWriteToContract returns wagmi write when configured", () => {
            const wagmiWriteReturn = { writeAsync: jest.fn(), isLoading: false };
            mockWagmiWrite.mockReturnValueOnce(wagmiWriteReturn);

            const res = useWriteToContract({ chainId: 1, contractName: "marketplace", functionName: "create" });
            expect(mockWagmiWrite).toHaveBeenCalledWith({
                address: "0xMARKET",
                abi: ["abiMarket"],
                functionName: "create",
            });
            expect(res).toBe(wagmiWriteReturn);
        });

        it("useWriteToContract returns fallback when contract missing", () => {
            const res = useWriteToContract({ chainId: 999, contractName: "marketplace", functionName: "create" });
            expect(typeof res.writeAsync).toBe("function");
            return expect(res.writeAsync()).rejects.toThrow("Contract not configured");
        });
    });
});
