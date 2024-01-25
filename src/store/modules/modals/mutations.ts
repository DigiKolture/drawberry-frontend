import { MutationTree } from "vuex";
import { ModalState } from "@/store/modules/modals/types";
const fixedModals = ["manage_esp"];

const isFixed = (modal: string) => {
  return !fixedModals.includes(modal);
};

export const mutations: MutationTree<ModalState> = {
  TOGGLE_MODAL(state: ModalState, modal: string): boolean {
    const modals = Object.keys(state).filter(isFixed);
    // Close all open modals before opening another
    if (!state[modal]) {
      for (const modal of modals) {
        state[modal] = false;
      }
    }

    state[modal] = !state[modal];
    return state[modal];
  },
  OPEN_MODAL(state: ModalState, modal: string): boolean {
    state[modal] = true;
    return state[modal];
  },
  CLOSE_MODAL(state: ModalState, modal: string): boolean {
    state[modal] = false;
    return state[modal];
  },
  CLOSE_MODALS(state: ModalState): ModalState {
    const modals = Object.keys(state).filter(isFixed);

    for (const modal of modals) {
      state[modal] = false;
    }
    return state;
  },
  CLOSE_ALL_MODALS(state: ModalState): ModalState {
    const allModals = Object.keys(state);

    for (const modal of allModals) {
      state[modal] = false;
    }
    return state;
  },
  CLOSE_ALL_RIGHT_PANELS(state: ModalState): ModalState {
    state.manage_esp = false;
    return state;
  },
};
