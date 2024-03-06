import { MutationTree } from "vuex";
import { ModalState } from "@/store/modules/modals/types";
const fixedModals = ["manage_esp"];

const isFixed = (modal: string) => {
  return !fixedModals.includes(modal);
};

const closeModal = (state: ModalState, modal: string) => {
  if (typeof state[modal] === "boolean") {
    state[modal] = false;
  } else if (typeof state[modal] === "string") {
    state[modal] = "";
  } else if (typeof state[modal] === "number") {
    state[modal] = -1;
  }
};

const closeModals = (state: ModalState, modals: string[]) => {
  for (const modal of modals) {
    closeModal(state, modal);
  }
};

export const mutations: MutationTree<ModalState> = {
  TOGGLE_MODAL(state: ModalState, modal: string): boolean | string | number {
    const modals = Object.keys(state).filter(isFixed);
    // Close all open modals before opening another
    if (!state[modal]) {
      closeModals(state, modals);
    }

    state[modal] = !state[modal];
    return state[modal];
  },
  TOGGLE_STRING_MODAL(
    state: ModalState,
    { modal, value }
  ): boolean | string | number {
    const modals = Object.keys(state).filter(isFixed);
    // Close all open modals before opening another
    if (!state[modal] || state[modal] === -1) {
      closeModals(state, modals);
    }

    if (state[modal] === value) {
      if (typeof state[modal] === "string") {
        state[modal] = "";
      } else if (typeof state[modal] === "number") {
        state[modal] = -1;
      }
    } else {
      state[modal] = value;
    }
    return state[modal];
  },
  OPEN_MODAL(state: ModalState, modal: string): boolean | string | number {
    if (typeof state[modal] !== "boolean") return state[modal];
    state[modal] = true;
    return state[modal];
  },
  CLOSE_MODAL(state: ModalState, modal: string): boolean | string | number {
    closeModal(state, modal);
    return state[modal];
  },
  CLOSE_MODALS(state: ModalState): ModalState {
    const modals = Object.keys(state).filter(isFixed);
    closeModals(state, modals);
    return state;
  },
  CLOSE_ALL_MODALS(state: ModalState): ModalState {
    const allModals = Object.keys(state);
    closeModals(state, allModals);
    return state;
  },
  CLOSE_ALL_RIGHT_PANELS(state: ModalState): ModalState {
    state.manage_esp = false;
    return state;
  },
};
