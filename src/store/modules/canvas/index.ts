import { Module } from "vuex";
import {
  CanvasState,
  CanvasSaveStatus,
  CanvasLoadingState,
} from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/canvas/getters";
import { mutations } from "@/store/modules/canvas/mutations";
import { actions } from "@/store/modules/canvas/actions";

const state: CanvasState = {
  focusedElement: null,
  focusedParentElement: null,
  focusedChildrenElements: [],
  currentHoverElement: {
    id: null,
    componentIndex: null,
  },
  focusedIndex: null,
  workspaceComponents: [],
  updatedComponents: [],
  hasWorkspaceComponent: false,
  saveStatus: CanvasSaveStatus.SAVED,
  loadState: CanvasLoadingState.UNINITIALIZED,
  //Difference between generalStyle and style is that generalStyle won't be mutated
  generalStyle: {
    layout: "",
    backgroundColor: "",
    fontFamily: "",
    buttonColor: "",
    backgroundImage: "",
    previewText: "",
  },
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
  scrollIntervalsIds: [],
  sidebarNavContent: null,
  sidebarDock: false,
  dropLoading: false,
  savedColors: [],
};

export const data: Module<CanvasState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default data;
