import { Module } from "vuex";
import { ProjectState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/projects/getters";
import { mutations } from "@/store/modules/projects/mutations";
import { actions } from "@/store/modules/projects/actions";

const state: ProjectState = {
  projects: [],
  project: null,
};

export const auth: Module<ProjectState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default auth;
