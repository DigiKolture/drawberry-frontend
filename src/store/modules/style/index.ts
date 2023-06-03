import { Module } from "vuex";
import { StyleState } from "@/store/modules/style/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/style/getters";
import { mutations } from "@/store/modules/style/mutations";
import { actions } from "@/store/modules/style/actions";

const state: StyleState = {
  layout: "cards",
  bgColor: "#FFFFFF",
};

export const data: Module<StyleState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
