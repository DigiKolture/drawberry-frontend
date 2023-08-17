import { MutationTree } from "vuex";
import { ModalState } from "@/store/modules/modals/types";

export const mutations: MutationTree<ModalState> = {
  TOGGLE_MODAL(state: ModalState, modal: string): boolean {
    state[modal] = !state[modal];
    return state[modal];
  },
  CLOSE_ALL_MODALS(state: ModalState): ModalState {
    state.manageESP = false;
    return state;
  },
};
