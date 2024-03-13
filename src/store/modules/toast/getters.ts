import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { ToastDataType, ToastState } from "@/store/modules/toast/types";

export const getters: GetterTree<ToastState, RootState> = {
  visible(state: ToastState): boolean {
    return state.visible;
  },
  message(state: ToastState): string {
    return state.message;
  },
  type(state: ToastState): string {
    return state.type;
  },

  data(state: ToastState): ToastDataType {
    return state.data;
  },
};
