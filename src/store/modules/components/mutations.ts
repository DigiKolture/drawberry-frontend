import { MutationTree } from "vuex";
import { ComponentState } from "@/store/modules/components/types";

export const mutations: MutationTree<ComponentState> = {
  SET_COMPONENTS(state: ComponentState, data: object[]) {
    state.components = data;
    return state.components;
  },
  SET_COMPONENT_ITEMS(state: ComponentState, data: object[]) {
    state.componentItems = data;
    return state.componentItems;
  },
  SET_MY_COMPONENT_ITEMS(state: ComponentState, data: any[]) {
    state.myComponentItems = data;
    return state.myComponentItems;
  },
  SET_SELECTED_COMPONENT(state: ComponentState, data: any) {
    state.selectedComponent = data;
    return state.selectedComponent;
  },
  // Drag state mutations
  SET_SIDEBAR_DRAGGED_COMPONENT_ITEM_INDEX(
    state: ComponentState,
    index: number | null
  ) {
    state.sidebarDraggedComponentItemIndex = index;
  },
  SET_DRAGGED_COMPONENT_ITEM_INDEX(
    state: ComponentState,
    index: number | null
  ) {
    state.draggedComponentItemIndex = index;
  },
  SET_DRAG_SOURCE(state: ComponentState, source: string | null) {
    state.dragSource = source;
  },
  SET_DRAGGED_COMPONENT_ITEM_HEIGHT(
    state: ComponentState,
    height: number | null
  ) {
    state.draggedComponentItemHeight = height;
  },
  SET_DRAGGED_COMPONENT_ITEM_OFFSET_Y(
    state: ComponentState,
    offsetY: number | null
  ) {
    state.draggedComponentItemOffsetY = offsetY;
  },
  SET_DRAGGED_COMPONENT_ITEM_CURRENT_Y(
    state: ComponentState,
    currentY: number | null
  ) {
    state.draggedComponentItemCurrentY = currentY;
  },

  // Helper mutation to set all drag data at once
  SET_SIDEBAR_COMPONENT_DATA(
    state: ComponentState,
    payload: {
      index: number;
      source: string;
    }
  ) {
    state.sidebarDraggedComponentItemIndex = payload.index;
    state.dragSource = payload.source;
  },

  // Helper mutation to set all drag data at once
  SET_DRAG_DATA(
    state: ComponentState,
    payload: {
      index: number;
      source: string;
      height: number;
      offsetY: number;
      currentY: number;
    }
  ) {
    state.draggedComponentItemIndex = payload.index;
    state.dragSource = payload.source;
    state.draggedComponentItemHeight = payload.height;
    state.draggedComponentItemOffsetY = payload.offsetY;
    state.draggedComponentItemCurrentY = payload.currentY;
  },

  // Helper mutation to clear all drag data
  CLEAR_DRAG_DATA(state: ComponentState) {
    state.sidebarDraggedComponentItemIndex = null;
    state.draggedComponentItemIndex = null;
    state.dragSource = null;
    state.draggedComponentItemHeight = null;
    state.draggedComponentItemOffsetY = null;
    state.draggedComponentItemCurrentY = null;
  },
};
