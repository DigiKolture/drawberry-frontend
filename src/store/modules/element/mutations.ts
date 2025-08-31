import { MutationTree } from "vuex";
import { ElementState } from "@/store/modules/element/types";

export const mutations: MutationTree<ElementState> = {
  SET_IS_DRAGGING(state, data): boolean {
    state.isDragging = data;
    return state.isDragging;
  },
  SET_FROM_ITEM_ELEMENT_ID(state, data): string | null {
    state.fromItemElementId = data;
    return state.fromItemElementId;
  },
  SET_FROM_ITEM_ELEMENT_INDEX(state, data): number | null {
    state.fromItemElementIndex = data;
    return state.fromItemElementIndex;
  },
  SET_LAST_DRAG_FROM_ELEMENT_ID(state, data): string | null {
    state.lastDragFromElementId = data;
    return state.lastDragFromElementId;
  },
  SET_LAST_DRAG_TO_ELEMENT_ID(state, data): string | null {
    state.lastDragToElementId = data;
    return state.lastDragToElementId;
  },
  RESET_ELEMENT_DRAG_AND_DROP(state): void {
    state.isDragging = false;
    state.lastDragFromElementId = null;
    state.lastDragToElementId = null;
  },
};
