import { MutationTree } from "vuex";
import { ToastState } from "@/store/modules/toast/types";

export const mutations: MutationTree<ToastState> = {
  SHOW_TOAST(state, { message, type }) {
    state.message = message;
    state.type = type;
    state.visible = true;
  },
  HIDE_TOAST(state) {
    state.visible = false;
  },
};
