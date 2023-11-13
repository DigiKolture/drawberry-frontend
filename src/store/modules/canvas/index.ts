import { Module } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/canvas/getters";
import { mutations } from "@/store/modules/canvas/mutations";
import { actions } from "@/store/modules/canvas/actions";

const state: CanvasState = {
  focusedElement: null,
  currentHoverElement: {
    id: null,
    componentIndex: null,
  },
  focusedIndex: null,
  workspaceComponents: [],
  hasWorkspaceComponent: false,
  style: {
    layout: "",
    backgroundColor: "",
    fontFamily: "",
    buttonColor: "",
    backgroundImage: "",
    previewText: "",
  },
  googleFonts: [],
  fontWeights: [],
  sidebarNavContent: null,
  sidebarDock: false,
};

export const data: Module<CanvasState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
