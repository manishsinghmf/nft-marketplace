import { create } from "zustand";

export const useModalStore = create((set) => ({
    modal: {
        open: false,
        heading: "",
        description: "",
        buttonEnabled: true,
        actionText: "OK",
        onAction: null,
    },

    /** ----------------------------------------------------------
     * openModal()
     * Supports BOTH formats:
     *   openModal("Title", "Description");
     *   openModal({ heading, description, ... });
     * --------------------------------------------------------- */
    openModal: (headingOrObj, description = "", buttonEnabled = true) => {
        // Case 1 — called as: openModal("Title", "Desc")
        if (typeof headingOrObj === "string") {
            return set(() => ({
                modal: {
                    open: true,
                    heading: headingOrObj,
                    description,
                    buttonEnabled,
                    actionText: "OK",
                    onAction: null,
                },
            }));
        }

        // Case 2 — called as: openModal({ heading, description, ... })
        const payload = headingOrObj || {};

        return set(() => ({
            modal: {
                open: true,
                heading: payload.heading || "",
                description: payload.description || "",
                buttonEnabled: payload.buttonEnabled ?? true,
                actionText: payload.actionText || "OK",
                onAction: payload.onAction || null,
            },
        }));
    },

    /** ----------------------------------------------------------
     * setModal() — override modal partially
     * Example:
     *  setModal({ heading: "Success", description: "Done!" })
     * --------------------------------------------------------- */
    setModal: (updates = {}) =>
        set((state) => ({
            modal: {
                ...state.modal,
                ...updates,
                open: updates.open ?? true, // default stays open
            },
        })),

    /** ----------------------------------------------------------
     * closeModal()
     * --------------------------------------------------------- */
    closeModal: () =>
        set((state) => ({
            modal: { ...state.modal, open: false },
        })),
}));
