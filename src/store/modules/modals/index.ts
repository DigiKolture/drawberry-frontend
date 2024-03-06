import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/modals/getters";
import { mutations } from "@/store/modules/modals/mutations";
import { actions } from "@/store/modules/modals/actions";
import { ModalState } from "@/store/modules/modals/types";

export const stated: ModalState = {
  preview: false,
  export: false,
  manage_esp: false,
  share_preview: false,
  color_picker: "",
  project_create: false,
  project_item: -1,
  folder_item: -1,
};

export const modals: Module<ModalState, RootState> = {
  namespaced: true,
  state: stated,
  getters,
  actions,
  mutations,
};

export default modals;
