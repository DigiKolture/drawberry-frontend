import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { LayersState } from "@/store/modules/layers/types";

export const getters: GetterTree<LayersState, RootState> = {
  tabStates(state: LayersState): Record<string, boolean> {
    return state.tabStates;
  },
};
