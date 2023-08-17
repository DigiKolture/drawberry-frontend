import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { ModalState } from "@/store/modules/modals/types";

export const getters: GetterTree<ModalState, RootState> = {
  manageESP(state: ModalState): boolean {
    return state.manage_esp;
  },
};
