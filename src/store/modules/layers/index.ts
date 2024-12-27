import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/layers/getters";
import { mutations } from "@/store/modules/layers/mutations";
import { actions } from "@/store/modules/layers/actions";
import { LayersState } from "@/store/modules/layers/types";

const state: LayersState = {
  tabStates: {},
};

export const modals: Module<LayersState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default modals;
