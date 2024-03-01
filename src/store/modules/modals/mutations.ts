import { MutationTree } from "vuex";
import { ModalState } from "@/store/modules/modals/types";
const fixedModals = ["manage_esp"];

const isFixed = (modal: string) => {
  return !fixedModals.includes(modal);
};

export const mutations: MutationTree<ModalState> = {
  TOGGLE_MODAL(state: ModalState, modal: string): boolean | string {
    const modals = Object.keys(state).filter(isFixed);
    // Close all open modals before opening another
    if (!state[modal]) {
      for (const modal of modals) {
        if (typeof state[modal] === "boolean") {
          state[modal] = false;
        } else if (typeof state[modal] === "string") {
          state[modal] = "";
        }
      }
    }

    state[modal] = !state[modal];
    return state[modal];
  },
  TOGGLE_STRING_MODAL(state: ModalState, { modal, value }): boolean | string {
    const modals = Object.keys(state).filter(isFixed);
    // Close all open modals before opening another
    if (!state[modal]) {
      for (const modal of modals) {
        if (typeof state[modal] === "boolean") {
          state[modal] = false;
        } else if (typeof state[modal] === "string") {
          state[modal] = "";
        }
      }
    }

    if (state[modal] && state[modal] === value) {
      state[modal] = "";
    } else {
      state[modal] = value;
    }
    return state[modal];
  },
  OPEN_MODAL(state: ModalState, modal: string): boolean | string {
    if (typeof state[modal] !== "boolean") return state[modal];
    state[modal] = true;
    return state[modal];
  },
  CLOSE_MODAL(state: ModalState, modal: string): boolean | string {
    if (typeof state[modal] === "boolean") {
      state[modal] = false;
    } else if (typeof state[modal] === "string") {
      state[modal] = "";
    }
    return state[modal];
  },
  CLOSE_MODALS(state: ModalState): ModalState {
    const modals = Object.keys(state).filter(isFixed);

    for (const modal of modals) {
      if (typeof state[modal] === "boolean") {
        state[modal] = false;
      } else if (typeof state[modal] === "string") {
        state[modal] = "";
      }
    }
    return state;
  },
  CLOSE_ALL_MODALS(state: ModalState): ModalState {
    const allModals = Object.keys(state);

    for (const modal of allModals) {
      if (typeof state[modal] === "boolean") {
        state[modal] = false;
      } else if (typeof state[modal] === "string") {
        state[modal] = "";
      }
    }
    return state;
  },
  CLOSE_ALL_RIGHT_PANELS(state: ModalState): ModalState {
    state.manage_esp = false;
    return state;
  },
};
