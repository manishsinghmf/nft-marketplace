import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../Modal";

// Portal root
beforeEach(() => {
    document.body.innerHTML = `<div id="modal-root"></div>`;
});

// Mock RingLoader
vi.mock("react-spinners/RingLoader", () => ({
    default: () => <div data-testid="ring-loader" />,
}));

// Zustand mock (NO SELECTOR — always return state)
let closeModalMock = vi.fn();
let onActionMock = vi.fn();

let mockStoreState = {
    modal: {
        open: true,
        heading: "Test Heading",
        description: "Test description",
        loading: false,
        actionText: "Confirm",
        onAction: onActionMock,
    },
    closeModal: closeModalMock,
};

vi.mock("../../../store/modalStore", () => ({
    useModalStore: () => mockStoreState,
}));

describe("Modal Component", () => {
    beforeEach(() => {
        closeModalMock = vi.fn();
        onActionMock = vi.fn();

        mockStoreState = {
            modal: {
                open: true,
                heading: "Test Heading",
                description: "Test description",
                loading: false,
                actionText: "Confirm",
                onAction: onActionMock,
            },
            closeModal: closeModalMock,
        };
    });

    it("renders heading + description inside portal", () => {
        render(<Modal />);
        expect(screen.getByText("Test Heading")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("calls closeModal when overlay is clicked", () => {
        render(<Modal />);

        fireEvent.click(document.querySelector(".darkBG"));
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });

    it("calls closeModal when close button is clicked", () => {
        render(<Modal />);

        fireEvent.click(screen.getByText("X"));
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });

    it("calls onAction then closeModal when action button is clicked", () => {
        render(<Modal />);

        fireEvent.click(screen.getByText("Confirm"));
        expect(onActionMock).toHaveBeenCalledTimes(1);
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });

    it("renders loader when loading = true", () => {
        mockStoreState.modal.loading = true;
        mockStoreState.modal.actionText = null;

        render(<Modal />);

        expect(screen.getByTestId("ring-loader")).toBeInTheDocument();
        expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
    });

    it("returns null when modal.open = false", () => {
        mockStoreState.modal.open = false;

        render(<Modal />);

        const root = document.getElementById("modal-root");
        expect(root.innerHTML.trim()).toBe("");
    });
});
