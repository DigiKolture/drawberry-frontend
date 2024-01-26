import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { ToastState } from "@/store/modules/toast/types";

export const actions: ActionTree<ToastState, RootState> = {
  showToast({ commit }, { message, type = "success" }) {
    console.log("<<<< >>>>>");
    commit("SHOW_TOAST", { message, type });
    setTimeout(() => {
      commit("HIDE_TOAST");
    }, 5000);
  },
};
