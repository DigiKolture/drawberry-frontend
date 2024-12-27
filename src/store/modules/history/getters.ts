import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { HistoryAction, HistoryState } from "@/store/modules/history/types";

export const getters: GetterTree<HistoryState, RootState> = {
  undoStack(state: HistoryState): HistoryAction[] {
    return state.undoStack;
  },
  redoStack(state: HistoryState): HistoryAction[] {
    return state.redoStack;
  },
};
