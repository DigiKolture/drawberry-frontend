import { GetterTree } from "vuex";
import { StyleState } from "@/store/modules/style/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<StyleState, RootState> = {
  layout(state: StyleState): string {
    return state.layout;
  },
  bgColor(state: StyleState): string {
    return state.bgColor;
  },
};
