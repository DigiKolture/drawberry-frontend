import { GetterTree } from "vuex";
import {
  CatalogEntry,
  Connection,
  ConnectorsState,
} from "@/store/modules/connectors/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<ConnectorsState, RootState> = {
  catalog(state: ConnectorsState): CatalogEntry[] {
    return state.catalog;
  },
  connections(state: ConnectorsState): Connection[] {
    return state.connections;
  },
  connectionFor:
    (state: ConnectorsState) =>
    (connectorKey: string): Connection | undefined => {
      return state.connections.find(
        (connection: Connection) => connection.connectorKey === connectorKey
      );
    },
};
