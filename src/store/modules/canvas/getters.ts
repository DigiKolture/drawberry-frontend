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
  sidebarNavContent(state: CanvasState): string | null {
    return state.sidebarNavContent;
  },
  sidebarDock(state: CanvasState): boolean {
    return state.sidebarDock;
  },
};
