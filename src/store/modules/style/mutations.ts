import { MutationTree } from "vuex";
import { StyleState } from "@/store/modules/style/types";

export const mutations: MutationTree<StyleState> = {
  SET_LAYOUT(state: StyleState, data: string) {
    state.layout = data;
    return state.layout;
  },
  SET_BG_COLOR(state: StyleState, data: string) {
    state.bgColor = data;
    return state.bgColor;
  },
};
