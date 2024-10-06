import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/history/getters";
import { mutations } from "@/store/modules/history/mutations";
import { actions } from "@/store/modules/history/actions";
import { HistoryState } from "@/store/modules/history/types";

export const state: HistoryState = {
  undoStack: [],
  redoStack: [],
};

export const toast: Module<HistoryState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default toast;
