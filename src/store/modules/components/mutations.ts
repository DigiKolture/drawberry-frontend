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
  SET_MY_COMPONENT_ITEMS(state: ComponentState, data: object[]) {
    state.myComponentItems = data;
    return state.myComponentItems;
  },
};
