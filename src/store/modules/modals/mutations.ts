import { MutationTree } from "vuex";
import { ModalState } from "@/store/modules/modals/types";

export const mutations: MutationTree<ModalState> = {
  TOGGLE_MODAL(state: ModalState, modal: string): boolean {
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
  CLOSE_ALL_MODALS(state: ModalState): ModalState {
    state.manage_esp = false;
    return state;
  },
  CLOSE_ALL_RIGHT_PANELS(state: ModalState): ModalState {
    state.manage_esp = false;
    return state;
  },
};
