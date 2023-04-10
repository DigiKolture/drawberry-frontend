import { GetterTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<CanvasState, RootState> = {
  focusedElement(state: CanvasState): object | null {
    return state.focusedElement;
  },
  focusedIndex(state: CanvasState): number | null {
    return state.focusedIndex;
  },
  workspaceComponents(state: CanvasState): object[] | null {
    return state.workspaceComponents;
  },
};
