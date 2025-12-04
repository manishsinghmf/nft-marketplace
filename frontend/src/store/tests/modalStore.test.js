// src/store/tests/modalStore.test.js
import { modalStoreInstance } from "../modalStore";

// Reset Zustand store to initial state each test
beforeEach(() => {
    modalStoreInstance.setState(modalStoreInstance.getInitialState());
});

describe("modalStore", () => {
    test("openModal with string arguments", () => {
        const { openModal, modal } = modalStoreInstance.getState();

        openModal("Hello", "World");

        const updated = modalStoreInstance.getState().modal;

        expect(updated.open).toBe(true);
        expect(updated.heading).toBe("Hello");
        expect(updated.description).toBe("World");
        expect(updated.loading).toBe(true);
        expect(updated.actionText).toBe("OK");
    });

    test("openModal with object payload", () => {
        const { openModal } = modalStoreInstance.getState();

        openModal({
            heading: "Alert",
            description: "Something happened!",
            loading: false,
            actionText: "Close",
            context: "test",
        });

        const updated = modalStoreInstance.getState().modal;

        expect(updated).toMatchObject({
            open: true,
            heading: "Alert",
            description: "Something happened!",
            loading: false,
            actionText: "Close",
            context: "test",
        });
    });

    test("setModal updates modal partially", () => {
        const { openModal, setModal } = modalStoreInstance.getState();

        openModal("Start", "Initial");

        setModal({ heading: "Updated", loading: false });

        const updated = modalStoreInstance.getState().modal;

        expect(updated.heading).toBe("Updated");
        expect(updated.loading).toBe(false);

        // unchanged fields
        expect(updated.description).toBe("Initial");
    });

    test("closeModal closes modal when no context provided", () => {
        const { openModal, closeModal } = modalStoreInstance.getState();

        openModal("Test", "Desc");
        closeModal();

        expect(modalStoreInstance.getState().modal.open).toBe(false);
    });

    test("closeModal only closes modal for matching context", () => {
        const { openModal, closeModal } = modalStoreInstance.getState();

        openModal({ heading: "A", description: "B", context: "ctx1" });

        // Wrong context → should NOT close
        closeModal("wrong");

        expect(modalStoreInstance.getState().modal.open).toBe(true);

        // Correct context
        closeModal("ctx1");

        expect(modalStoreInstance.getState().modal.open).toBe(false);
    });
});
