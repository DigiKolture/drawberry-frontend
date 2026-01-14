import { Module } from "vuex";
import { ComponentState } from "@/store/modules/components/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/components/getters";
import { mutations } from "@/store/modules/components/mutations";
import { actions } from "@/store/modules/components/actions";

const state: ComponentState = {
  components: [],
  componentItems: [],
  myComponentItems: [],
  selectedComponent: null,
  sidebarDraggedComponentItemIndex: null,
  draggedComponentItemIndex: null,
  dragSource: null,
  draggedComponentItemHeight: null,
  draggedComponentItemOffsetY: null,
  draggedComponentItemCurrentY: null,
};

export const data: Module<ComponentState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
