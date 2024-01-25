import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { ModalState } from "@/store/modules/modals/types";

export const actions: ActionTree<ModalState, RootState> = {
  toggleModal({ commit, state }, modal: string): void {
    if (!state[modal]) {
      commit("CLOSE_ALL_MODALS");
    }
    commit("TOGGLE_MODAL", modal);
  },
  closeModals({ commit }): void {
    commit("CLOSE_MODALS");
  },
  closeAllModals({ commit }): void {
    commit("CLOSE_ALL_MODALS");
  },
};
