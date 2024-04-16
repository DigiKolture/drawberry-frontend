import { GetterTree } from "vuex";
import { ProjectState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<ProjectState, RootState> = {
  projects(state: ProjectState): object[] | null {
    return state.projects;
  },
  filteredProjects(state: ProjectState): object[] | null {
    return state.filteredProjects;
  },
  project(state: ProjectState): object | null {
    return state.project;
  },
  projectId(state: ProjectState): string | null {
    return state.projectId;
  },
};
