import { MutationTree } from "vuex";
import { ESPState } from "@/store/modules/esp/types";

export const mutations: MutationTree<ESPState> = {
  SET_ESPS(state: ESPState, data: object[]) {
    state.ESPs = data;
    return state.ESPs;
  },
};
