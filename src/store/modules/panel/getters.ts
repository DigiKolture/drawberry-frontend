import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { PanelState } from "@/store/modules/panel/types";

export const getters: GetterTree<PanelState, RootState> = {
  tabStates(state: PanelState): Record<string, boolean> {
    return state.tabStates;
  },
};
