import { GetterTree } from "vuex";
import { ComponentState } from "@/store/modules/components/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<ComponentState, RootState> = {
  components(state: ComponentState): object[] | null {
    return state.components;
  },
  selectedComponent(state: ComponentState): object | null {
    return state.selectedComponent;
  },
  componentItems(state: ComponentState): object[] | null {
    return state.componentItems;
  },
  myComponentItems(state: ComponentState): object[] | null {
    return state.myComponentItems;
  },
  sidebarDraggedComponentItemIndex(state: ComponentState): number | null {
    return state.sidebarDraggedComponentItemIndex;
  },
  draggedComponentItemIndex(state: ComponentState): number | null {
    return state.draggedComponentItemIndex;
  },
  dragSource(state: ComponentState): string | null {
    return state.dragSource;
  },
  draggedComponentItemHeight(state: ComponentState): number | null {
    return state.draggedComponentItemHeight;
  },
  draggedComponentItemOffsetY(state: ComponentState): number | null {
    return state.draggedComponentItemOffsetY;
  },
  draggedComponentItemCurrentY(state: ComponentState): number | null {
    return state.draggedComponentItemCurrentY;
  },
};
