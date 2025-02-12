import { Module } from "vuex";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/preview/getters";
import { mutations } from "@/store/modules/preview/mutations";
import { actions } from "@/store/modules/preview/actions";
import { PreviewState } from "@/store/modules/preview/types";

const state: PreviewState = {
  navigatedFromCanvas: false, // This is used to check if the user navigated from the canvas page when on the preview page
  currentPreview: "desktop",
  project: null,
  components: [],
  style: {
    layout: "",
    backgroundColor: "",
    fontFamily: "",
    buttonColor: "",
    backgroundImage: "",
    previewText: "",
  },
};

export const data: Module<PreviewState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
