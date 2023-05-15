import { MutationTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { updateDom } from "@/composables/canvas/update_dom";

export const mutations: MutationTree<CanvasState> = {
  SET_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    state.focusedElement = data;
    return state.focusedElement;
  },
  SET_WORKSPACE_COMPONENTS(state: CanvasState, data: any[]) {
    state.workspaceComponents = data;
    return state.workspaceComponents;
  },
  UPDATE_FOCUSED_JSON_AND_DOM(state: CanvasState, data: object): any {
    state.focusedElement = data;
    const workspaceComponents = state.workspaceComponents;

    if (state.focusedIndex === null) {
      return state.focusedElement;
    }
    const projectComponentItem = workspaceComponents[state.focusedIndex];
    const elementJson: any = state.focusedElement;

    const jsonIndex = projectComponentItem.json.findIndex(
      (el: any) => el.id == elementJson.id
    );
    projectComponentItem.json[jsonIndex] = state.focusedElement;

    const html = projectComponentItem.html;
    const { updateElementDom } = updateDom();

    projectComponentItem.html = updateElementDom(html, elementJson);
    state.workspaceComponents = workspaceComponents;
    return state.focusedElement;
  },
  SET_FOCUSED_INDEX(state: CanvasState, data: number) {
    state.focusedIndex = data;
    return state.focusedIndex;
  },
  SET_SIDEBAR_NAVBAR_CONTENT(state: CanvasState, data: string) {
    state.sidebarNavContent = data;
    return state.sidebarNavContent;
  },
  SET_SIDEBAR_DOCK(state: CanvasState, data: boolean) {
    state.sidebarDock = data;
    return state.sidebarDock;
  },
};
