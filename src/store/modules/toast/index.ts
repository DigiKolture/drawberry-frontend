import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/toast/getters";
import { mutations } from "@/store/modules/toast/mutations";
import { actions } from "@/store/modules/toast/actions";
import { ToastState } from "@/store/modules/toast/types";

export const state: ToastState = {
  visible: false,
  message: "",
  type: "",
  data: {
    action: "",
    actionName: "",
    body: null,
  },
};

export const toast: Module<ToastState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default toast;
