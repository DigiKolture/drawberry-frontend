import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/panel/getters";
import { mutations } from "@/store/modules/panel/mutations";
import { actions } from "@/store/modules/panel/actions";
import { PanelState } from "@/store/modules/panel/types";

const state: PanelState = {
  tabStates: {},
};

export const modals: Module<PanelState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default modals;
