import { MutationTree } from "vuex";
import { ProjectState } from "@/store/modules/projects/types";

export const mutations: MutationTree<ProjectState> = {
  SET_PROJECTS(state: ProjectState, data: object[]) {
    state.projects = data;
    return state.projects;
  },
  SET_PROJECT(state: ProjectState, data: object) {
    state.project = data;
    return state.project;
  },
};
