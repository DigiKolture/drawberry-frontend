import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { PreviewState } from "@/store/modules/preview/types";
import { ProjectStyle } from "@/store/modules/canvas/types";

export const getters: GetterTree<PreviewState, RootState> = {
  navigatedFromCanvas(state: PreviewState): boolean {
    return state.navigatedFromCanvas;
  },
  currentPreview(state: PreviewState): string | null {
    return state.currentPreview ? state.currentPreview : "desktop";
  },
  project(state: PreviewState): object | null {
    return state.project;
  },
  components(state: PreviewState): any[] {
    return state.components;
  },
  style(state: PreviewState): ProjectStyle {
    return state.style;
  },
};
