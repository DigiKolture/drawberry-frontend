import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/connectors/getters";
import { mutations } from "@/store/modules/connectors/mutations";
import { actions } from "@/store/modules/connectors/actions";
import { ConnectorsState } from "@/store/modules/connectors/types";

const state: ConnectorsState = {
  catalog: [],
  connections: [],
};

export const connectors: Module<ConnectorsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default connectors;
