import { MutationTree } from "vuex";
import { PreviewState } from "@/store/modules/preview/types";
import { ProjectStyle } from "@/store/modules/canvas/types";

export const mutations: MutationTree<PreviewState> = {
  SET_NAVIGATED_FROM_CANVAS(state: PreviewState, data: boolean) {
    state.navigatedFromCanvas = data;
    return state.navigatedFromCanvas;
  },
  SET_CURRENT_PREVIEW(state: PreviewState, data: string | null) {
    state.currentPreview = data;
    return state.currentPreview;
  },
  SET_PROJECT(state: PreviewState, data: object) {
    state.project = data;
    return state.project;
  },
  SET_STYLE(state: PreviewState, data: ProjectStyle) {
    state.style = data;
    return state.style;
  },
  SET_COMPONENTS(state: PreviewState, data: any[]) {
    state.components = data;
    return state.components;
  },
};
