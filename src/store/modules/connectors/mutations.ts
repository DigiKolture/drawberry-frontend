import { MutationTree } from "vuex";
import {
  CatalogEntry,
  Connection,
  ConnectorsState,
} from "@/store/modules/connectors/types";

export const mutations: MutationTree<ConnectorsState> = {
  SET_CATALOG(state: ConnectorsState, data: CatalogEntry[]) {
    state.catalog = data || [];
  },
  SET_CONNECTIONS(state: ConnectorsState, data: Connection[]) {
    state.connections = data || [];
  },
};
