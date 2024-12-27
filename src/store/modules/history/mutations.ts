import { MutationTree } from "vuex";
import { HistoryAction, HistoryState } from "@/store/modules/history/types";

export const mutations: MutationTree<HistoryState> = {
  SET_UNDO_STACK(state, data): HistoryAction[] {
    state.undoStack = data;
    return state.undoStack;
  },
  SET_REDO_STACK(state, data): HistoryAction[] {
    state.redoStack = data;
    return state.redoStack;
  },
  RESET_REDO_STACK(state): HistoryAction[] {
    state.redoStack = [];
    return state.redoStack;
  },
  RESET_HISTORY_STACK(state): void {
    state.undoStack = [];
    state.redoStack = [];
  },
};
