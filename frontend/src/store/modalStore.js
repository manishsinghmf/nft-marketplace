import { create } from "zustand";

export const useModalStore = create((set) => ({
    modal: {
        open: false,
        heading: "",
        description: "",
        loading: true,
        actionText: "OK",
        onAction: null,
        context: null,
    },
    /** ----------------------------------------------------------
     * openModal()
     * Supports BOTH formats:
     *   openModal("Title", "Description");
     *   openModal({ heading, description, ... });
     * --------------------------------------------------------- */
    openModal: (headingOrObj, description = "", loading = true, context = "general") => {
        // Case 1 — called as: openModal("Title", "Desc")
        if (typeof headingOrObj === "string") {
            return set(() => ({
                modal: {
                    open: true,
                    heading: headingOrObj,
                    description,
                    loading,
                    actionText: "OK",
                    onAction: null,
                    context,

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
                loading: payload.loading ?? true,
                actionText: payload.actionText || "OK",
                onAction: payload.onAction || null,
                context: payload.context || "general",
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
                open: updates.open ?? true,
                context: state.modal.context,
            },
        })),

    /** ----------------------------------------------------------
     * closeModal()
     * --------------------------------------------------------- */
    closeModal: (context) =>
        set((state) => {
            if (!context || context === state.modal.context) {
                return { modal: { ...state.modal, open: false } };
            }
            return {};
        }),
}));
