import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import PriceModal from "../PriceModal";

/* =====================================================
   HOIST-SAFE CONSTANT MOCK VALUES
===================================================== */

const OPEN_SPY = { fn: () => { } };
const SET_SPY = { fn: () => { } };

/* =====================================================
   CONTRACTS MOCK (hoist friendly — literal object only)
===================================================== */
vi.mock("@/config/contracts", () => ({
    CONTRACTS: {
        1: {
            name: "ETH",
            explorerUrl: "https://etherscan.io/tx/",
            marketplace: { address: "0xabc" },
            nft: { address: "0xdef" }
        }
    }
}));

/* =====================================================
   ZUSTAND MOCK (FIXED! uses object wrappers)
===================================================== */
vi.mock("@/store/modalStore", () => ({
    useModalStore: (selector) =>
        selector({
            openModal: (...args) => OPEN_SPY.fn(...args),
            setModal: (...args) => SET_SPY.fn(...args),
            closeModal: vi.fn(),
            modalData: {},
            isOpen: false,
        }),
}));

/* =====================================================
   WAGMI MOCK
===================================================== */
vi.mock("wagmi", () => ({
    useAccount: () => ({ address: "0x111", chainId: 1 }),
    useBalance: () => ({ data: { value: 10n ** 18n } }),
    usePublicClient: () => ({
        waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: "success" })
    }),
    useWalletClient: () => ({ data: { account: "0xabc" } })
}));

/* =====================================================
   SERVICE MOCKS — using alias "@/services/*"
===================================================== */
vi.mock("@/services/contractService", () => ({
    ContractService: {
        checkApproval: vi.fn(),
        approveAll: vi.fn(),
        createMarketItem: vi.fn(),
    }
}));

vi.mock("@/services/gasService", () => ({
    estimateTotalGasCost: vi.fn(),
}));

vi.mock("@/services/balanceService", () => ({
    BalanceService: {
        hasEnoughBalance: vi.fn(),
    },
}));

vi.mock("@/utils/formatError", () => ({
    formatError: () => "Formatted Error",
}));

/* =====================================================
   BEFORE EACH
===================================================== */
beforeEach(() => {
    document.body.innerHTML = `<div id="modal-root"></div>`;
    OPEN_SPY.fn = vi.fn();
    SET_SPY.fn = vi.fn();
});

/* =====================================================
   DEFAULT PROPS
===================================================== */
const props = {
    setShowPricePopup: vi.fn(),
    nftData: { nftId: 1, amount: 1 },
    listingFee: "0.01",
    refetchNFTs: vi.fn()
};

/* =====================================================
   TESTS
===================================================== */

describe("PriceModal", () => {

    it("renders modal", () => {
        render(<PriceModal {...props} />);
        expect(screen.getByText("Sell NFT")).toBeInTheDocument();
    });

    it("updates price input", () => {
        render(<PriceModal {...props} />);
        const input = screen.getByPlaceholderText("Enter price in ETH");
        fireEvent.change(input, { target: { value: "1.5" } });
        expect(input.value).toBe("1.5");
    });

    it("cancel closes modal", () => {
        render(<PriceModal {...props} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(props.setShowPricePopup).toHaveBeenCalledWith(false);
    });

    it("shows error for price = 0", () => {
        render(<PriceModal {...props} />);
        fireEvent.change(screen.getByPlaceholderText("Enter price in ETH"), {
            target: { value: "0" },
        });

        fireEvent.click(screen.getByText("Confirm"));

        expect(OPEN_SPY.fn).toHaveBeenCalledWith(
            "Invalid Price",
            "Price must be greater than 0.",
            false
        );
    });

    it("shows error when price < listing fee", () => {
        render(<PriceModal {...props} />);

        fireEvent.change(screen.getByPlaceholderText("Enter price in ETH"), {
            target: { value: "0.005" },
        });

        fireEvent.click(screen.getByText("Confirm"));

        expect(OPEN_SPY.fn).toHaveBeenCalled();
    });

    it("handles approval flow", async () => {
        const { ContractService } = await import("@/services/contractService");
        const { estimateTotalGasCost } = await import("@/services/gasService");
        const { BalanceService } = await import("@/services/balanceService");

        ContractService.checkApproval.mockResolvedValue(false);
        ContractService.approveAll.mockResolvedValue("0xAPPROVE");
        ContractService.createMarketItem.mockResolvedValue({ tx: "0x123" });

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 5n,
            requiredEth: 0.01,
        });

        BalanceService.hasEnoughBalance.mockReturnValue(true);

        render(<PriceModal {...props} />);

        fireEvent.change(screen.getByPlaceholderText("Enter price in ETH"), {
            target: { value: "1" }
        });

        fireEvent.click(screen.getByText("Confirm"));

        await waitFor(() =>
            expect(ContractService.approveAll).toHaveBeenCalled()
        );
    });

    it("handles insufficient balance", async () => {
        const { ContractService } = await import("@/services/contractService");
        const { estimateTotalGasCost } = await import("@/services/gasService");
        const { BalanceService } = await import("@/services/balanceService");

        ContractService.checkApproval.mockResolvedValue(true);

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 100n,
            requiredEth: 0.2
        });

        BalanceService.hasEnoughBalance.mockReturnValue(false);

        render(<PriceModal {...props} />);

        fireEvent.change(screen.getByPlaceholderText("Enter price in ETH"), {
            target: { value: "1" }
        });

        fireEvent.click(screen.getByText("Confirm"));

        await waitFor(() =>
            expect(SET_SPY.fn).toHaveBeenCalledWith(
                expect.objectContaining({
                    heading: "Insufficient Balance",
                })
            )
        );
    });

    it("handles createMarketItem error", async () => {
        const { ContractService } = await import("@/services/contractService");
        const { estimateTotalGasCost } = await import("@/services/gasService");
        const { BalanceService } = await import("@/services/balanceService");

        ContractService.checkApproval.mockResolvedValue(true);
        ContractService.createMarketItem.mockRejectedValue(new Error("bad tx"));

        estimateTotalGasCost.mockResolvedValue({
            requiredWei: 1n,
            requiredEth: 0.01
        });

        BalanceService.hasEnoughBalance.mockReturnValue(true);

        render(<PriceModal {...props} />);

        fireEvent.change(screen.getByPlaceholderText("Enter price in ETH"), {
            target: { value: "1" }
        });

        fireEvent.click(screen.getByText("Confirm"));

        await waitFor(() =>
            expect(SET_SPY.fn).toHaveBeenCalledWith(
                expect.objectContaining({
                    heading: "Sell Transaction Failed",
                })
            )
        );
    });

});
