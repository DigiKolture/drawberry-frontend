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
};
