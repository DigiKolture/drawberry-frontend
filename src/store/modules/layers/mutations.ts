import { MutationTree } from "vuex";
import { LayersState } from "@/store/modules/layers/types";
import { layers } from "@/composables/canvas/layers";
const { resetTabStates } = layers();
export const mutations: MutationTree<LayersState> = {
  SET_TAB_STATES(
    state: LayersState,
    data: Record<string, boolean>
  ): Record<string, boolean> {
    state.tabStates = data;
    return state.tabStates;
  },

  RESET_TAB_STATES(state: LayersState): Record<string, boolean> {
    state.tabStates = resetTabStates();
    return state.tabStates;
  },

  SET_ACTIVE_TAB_STATE(
    state: LayersState,
    data: string
  ): Record<string, boolean> {
    state.tabStates[data] = true;
    return state.tabStates;
  },

  TOGGLE_TAB_STATE(state: LayersState, data: string): Record<string, boolean> {
    state.tabStates[data] = !state.tabStates[data];
    return state.tabStates;
  },

  CLOSE_ALL_TAB_STATES(state: LayersState): Record<string, boolean> {
    for (const key in state.tabStates) {
      state.tabStates[key] = false;
    }
    return state.tabStates;
  },
};
