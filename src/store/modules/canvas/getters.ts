import { GetterTree } from "vuex";
import {
  CanvasState,
  CurrentHoverElementType,
  ProjectStyle,
  UpdatedComponent,
} from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<CanvasState, RootState> = {
  focusedElement(state: CanvasState): object | null {
    return state.focusedElement;
  },
  focusedParentElement(state: CanvasState): object | null {
    return state.focusedParentElement;
  },
  focusedChildrenElements(state: CanvasState): object | null {
    return state.focusedChildrenElements;
  },
  focusedIndex(state: CanvasState): number | null {
    return state.focusedIndex;
  },
  currentHoverElement(state: CanvasState): CurrentHoverElementType {
    return state.currentHoverElement;
  },
  workspaceComponents(state: CanvasState): object[] | null {
    return state.workspaceComponents;
  },
  saveStatus(state: CanvasState): string {
    return state.saveStatus;
  },
  hasWorkspaceComponent(state: CanvasState): boolean {
    return state.hasWorkspaceComponent;
  },
  generalStyle(state: CanvasState): ProjectStyle {
    return state.generalStyle;
  },
  style(state: CanvasState): ProjectStyle {
    return state.style;
  },
  updatedComponents(state: CanvasState): UpdatedComponent[] {
    return state.updatedComponents;
  },
  googleFonts(state: CanvasState): any[] {
    return state.googleFonts;
  },
  fontWeights(state: CanvasState): number[] {
    return state.fontWeights;
  },
  sidebarNavContent(state: CanvasState): string | null {
    return state.sidebarNavContent;
  },
  sidebarDock(state: CanvasState): boolean {
    return state.sidebarDock;
  },
  dropLoading(state: CanvasState): boolean {
    return state.dropLoading;
  },
  savedColors(state: CanvasState): string[] {
    return state.savedColors;
  },
};
