import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { ToastState } from "@/store/modules/toast/types";

const dataDefault = {
  action: "",
  actionName: "",
  body: null,
};

export const actions: ActionTree<ToastState, RootState> = {
  showToast({ commit }, { message, type = "success", data = dataDefault }) {
    commit("SHOW_TOAST", { message, type, data });
    setTimeout(() => {
      commit("HIDE_TOAST");
    }, 7000);
  },
};
