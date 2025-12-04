/**
 * IMPORTANT:
 * All mocks MUST come before the hook import.
 */

let openModalMock;
let setModalMock;
let navigateMock;

/* ----------------------------------------------
   ZUSTAND MOCK — MUST BE FIRST
---------------------------------------------- */
vi.mock("../../store/modalStore", () => ({
    useModalStore: (selector) =>
        selector({
            openModal: (...args) => openModalMock(...args),
            setModal: (...args) => setModalMock(...args),
            closeModal: vi.fn(),
            modalData: {},
            isOpen: false,
        }),
}));

/* ----------------------------------------------
   REACT ROUTER MOCK
---------------------------------------------- */
vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

/* ----------------------------------------------
   SERVICE MOCKS
---------------------------------------------- */
vi.mock("../../services/ipfsService", () => ({
    IpfsService: {
        uploadFile: vi.fn(),
        uploadNFTMetadata: vi.fn(),
    },
}));

vi.mock("../../services/contractService", () => ({
    ContractService: {
        mintNFT: vi.fn(),
    },
}));

vi.mock("../../services/gasService", () => ({
    estimateTotalGasCost: vi.fn(),
}));

vi.mock("../../services/balanceService", () => ({
    BalanceService: {
        hasEnoughBalance: vi.fn(),
    },
}));

/* ----------------------------------------------
   CONFIG MOCK
---------------------------------------------- */
vi.mock("../../config/contractFunctions", () => ({
    CONTRACT_FUNCTIONS: { NFT: { MINT: "mint" } },
}));

/* ----------------------------------------------
   FORMAT ERROR MOCK
---------------------------------------------- */
vi.mock("../../utils/formatError", () => ({
    formatError: (err) => `Formatted: ${err.message}`,
}));

/* ----------------------------------------------
   IMPORT HOOK (AFTER MOCKS)
---------------------------------------------- */
import { renderHook, act } from "@testing-library/react";
import useMintTx from "../useMintTx";

/* ----------------------------------------------
   FIXED PROPS + FORM DATA
---------------------------------------------- */
const baseProps = {
    chainConfig: {
        name: "ETH",
        explorerUrl: "https://etherscan.io/tx/",
    },
    chainId: 1,
    address: "0xabc",
    walletClient: { account: "0xabc" },
    publicClient: {
        waitForTransactionReceipt: vi.fn(),
    },
    balanceData: { value: 10n ** 18n },
};

const formData = {
    name: "Test NFT",
    description: "Desc",
    quantity: 1,
    rarity: "common",
    style: "modern",
    beauty: 10,
    comedy: 5,
    action: 2,
    image: new File(["data"], "img.png"),
};

/* ----------------------------------------------
   RESET MOCKS BEFORE EACH TEST
---------------------------------------------- */
beforeEach(() => {
    openModalMock = vi.fn();
    setModalMock = vi.fn();
    navigateMock = vi.fn();
    vi.clearAllMocks();
});

/* ----------------------------------------------
   TESTS
---------------------------------------------- */
describe("useMintTx Hook", () => {
    it("shows error when chainConfig is missing", async () => {
        const { result } = renderHook(() =>
            useMintTx({ ...baseProps, chainConfig: null })
        );

        await act(async () => result.current.mint(formData));

        expect(openModalMock).toHaveBeenCalledWith(
            "Unsupported Network",
            "Switch to a supported chain.",
            false
        );
    });

    it("shows error when walletClient is missing", async () => {
        const { result } = renderHook(() =>
            useMintTx({ ...baseProps, walletClient: null })
        );

        await act(async () => result.current.mint(formData));

        expect(openModalMock).toHaveBeenCalledWith(
            "Wallet Error",
            "Wallet not connected or not authorized.",
            false
        );
    });

    it("handles failed image upload", async () => {
        const { IpfsService } = await import("../../services/ipfsService");
        IpfsService.uploadFile.mockResolvedValue(null);

        const { result } = renderHook(() => useMintTx(baseProps));

        await act(async () => result.current.mint(formData));

        expect(setModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Failed",
                description: "Failed to upload image.",
            })
        );
    });

    it("handles failed metadata upload", async () => {
        const { IpfsService } = await import("../../services/ipfsService");

        IpfsService.uploadFile.mockResolvedValue("imgHash");
        IpfsService.uploadNFTMetadata.mockResolvedValue(null);

        const { result } = renderHook(() => useMintTx(baseProps));

        await act(async () => result.current.mint(formData));

        expect(setModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Failed",
                description: "Metadata upload failed.",
            })
        );
    });

    it("handles insufficient balance", async () => {
        const { IpfsService } = await import("../../services/ipfsService");
        const { estimateTotalGasCost } = await import("../../services/gasService");
        const { BalanceService } = await import("../../services/balanceService");

        IpfsService.uploadFile.mockResolvedValue("imgHash");
        IpfsService.uploadNFTMetadata.mockResolvedValue("metaHash");

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 999n * 10n ** 18n,
            requiredEth: 999,
        });

        BalanceService.hasEnoughBalance.mockReturnValue(false);

        const { result } = renderHook(() => useMintTx(baseProps));

        await act(async () => result.current.mint(formData));

        expect(setModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                heading: "Insufficient Balance",
            })
        );
    });

    it("successfully mints NFT and navigates", async () => {
        const { IpfsService } = await import("../../services/ipfsService");
        const { estimateTotalGasCost } = await import("../../services/gasService");
        const { BalanceService } = await import("../../services/balanceService");
        const { ContractService } = await import("../../services/contractService");

        IpfsService.uploadFile.mockResolvedValue("imgHash");
        IpfsService.uploadNFTMetadata.mockResolvedValue("metaHash");

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 1n,
            requiredEth: 0.001,
        });

        BalanceService.hasEnoughBalance.mockReturnValue(true);

        ContractService.mintNFT.mockResolvedValue({ tx: "0xTX" });

        baseProps.publicClient.waitForTransactionReceipt.mockResolvedValue({
            status: "success",
        });

        const { result } = renderHook(() => useMintTx(baseProps));

        await act(async () => result.current.mint(formData));

        expect(navigateMock).toHaveBeenCalledWith("/my-collection");
    });

    it("handles transaction error", async () => {
        const { IpfsService } = await import("../../services/ipfsService");
        const { estimateTotalGasCost } = await import("../../services/gasService");
        const { BalanceService } = await import("../../services/balanceService");
        const { ContractService } = await import("../../services/contractService");

        IpfsService.uploadFile.mockResolvedValue("imgHash");
        IpfsService.uploadNFTMetadata.mockResolvedValue("metaHash");

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 1n,
            requiredEth: 0.001,
        });

        BalanceService.hasEnoughBalance.mockReturnValue(true);

        ContractService.mintNFT.mockRejectedValue(new Error("tx failed"));

        const { result } = renderHook(() => useMintTx(baseProps));

        await act(async () => result.current.mint(formData));

        expect(setModalMock).toHaveBeenCalledWith(
            expect.objectContaining({ heading: "Error" })
        );
    });
});
