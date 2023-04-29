import { Module } from "vuex";
import { FolderState } from "@/store/modules/folders/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/folders/getters";
import { mutations } from "@/store/modules/folders/mutations";
import { actions } from "@/store/modules/folders/actions";

const state: FolderState = {
  folders: [],
  folder: null,
};

export const data: Module<FolderState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
