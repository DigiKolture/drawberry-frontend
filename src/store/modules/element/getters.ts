import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { ElementState } from "@/store/modules/element/types";

export const getters: GetterTree<ElementState, RootState> = {
  isDragging(state: ElementState): boolean {
    return state.isDragging;
  },
  fromItemElementId(state: ElementState): string | null {
    return state.fromItemElementId;
  },
  fromItemElementIndex(state: ElementState): number | null {
    return state.fromItemElementIndex;
  },
  lastDragFromElementId(state: ElementState): string | null {
    return state.lastDragFromElementId;
  },
  lastDragToElementId(state: ElementState): string | null {
    return state.lastDragToElementId;
  },
};
