import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/element/getters";
import { mutations } from "@/store/modules/element/mutations";
import { actions } from "@/store/modules/element/actions";
import { ElementState } from "@/store/modules/element/types";

export const state: ElementState = {
  isDragging: false,
  fromItemElementId: null,
  fromItemElementIndex: null,
  lastDragFromElementId: null,
  lastDragToElementId: null,
};

export const toast: Module<ElementState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default toast;
