import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

// Create vanilla store
export const modalStoreInstance = createStore((set) => ({
    modal: {
        open: false,
        heading: "",
        description: "",
        loading: true,
        actionText: "OK",
        onAction: null,
        context: "general",
    },

    openModal: (headingOrObj, description = "", loading = true, context = "general") => {
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

    setModal: (updates = {}) =>
        set((state) => ({
            modal: {
                ...state.modal,
                ...updates,
                open: updates.open ?? true,
            },
        })),

    closeModal: (context) =>
        set((state) => {
            if (!context || context === state.modal.context) {
                return { modal: { ...state.modal, open: false } };
            }
            return {};
        }),
}));

// 🔥 FIX: React hook version of the vanilla store
export const useModalStore = (selector) =>
    useStore(modalStoreInstance, selector || ((state) => state));
