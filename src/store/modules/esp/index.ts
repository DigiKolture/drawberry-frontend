import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/esp/getters";
import { mutations } from "@/store/modules/esp/mutations";
import { actions } from "@/store/modules/esp/actions";
import { ESPState } from "@/store/modules/esp/types";

const state: ESPState = {
  ESPs: [],
};

export const data: Module<ESPState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
