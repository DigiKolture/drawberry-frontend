import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/modals/getters";
import { mutations } from "@/store/modules/modals/mutations";
import { actions } from "@/store/modules/modals/actions";
import { ModalState } from "@/store/modules/modals/types";

const state: ModalState = {
  manage_esp: false,
};

export const modals: Module<ModalState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default modals;
