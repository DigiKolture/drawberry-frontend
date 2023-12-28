import { MutationTree } from "vuex";
import { PanelState } from "@/store/modules/panel/types";
import { panel } from "@/composables/canvas/panel";
const { resetTabStates } = panel();

export const mutations: MutationTree<PanelState> = {
  SET_TAB_STATES(
    state: PanelState,
    data: Record<string, boolean>
  ): Record<string, boolean> {
    state.tabStates = data;
    return state.tabStates;
  },

  RESET_TAB_STATES(state: PanelState): Record<string, boolean> {
    state.tabStates = resetTabStates();
    return state.tabStates;
  },

  SET_ACTIVE_TAB_STATE(
    state: PanelState,
    data: string
  ): Record<string, boolean> {
    state.tabStates[data] = !state.tabStates[data];
    return state.tabStates;
  },

  CLOSE_ALL_TAB_STATES(state: PanelState): Record<string, boolean> {
    for (const key in state.tabStates) {
      state.tabStates[key] = false;
    }
    return state.tabStates;
  },
};
