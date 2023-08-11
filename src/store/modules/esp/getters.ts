import { GetterTree } from "vuex";
import { ESPState } from "@/store/modules/esp/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<ESPState, RootState> = {
  ESPs(state: ESPState): object[] {
    return state.ESPs;
  },
};
