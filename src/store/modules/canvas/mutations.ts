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
  UPDATE_FOCUSED_JSON_AND_DOM(state: CanvasState, data: object) {
    state.focusedElement = data;
    const workspaceComponents = state.workspaceComponents;

    if (state.focusedIndex === null) {
      return state.focusedElement;
    }
    const componentItem = workspaceComponents[state.focusedIndex];
    const elementJson: any = state.focusedElement;

    const jsonIndex = componentItem.json.findIndex(
      (el: any) => el.id == elementJson.id
    );
    componentItem.json[jsonIndex] = state.focusedElement;

    const html = componentItem.html;
    const { updateElementDom } = updateDom();

    componentItem.html = updateElementDom(html, elementJson);
    state.workspaceComponents = workspaceComponents;
    return state.focusedElement;
  },
  SET_FOCUSED_INDEX(state: CanvasState, data: number) {
    state.focusedIndex = data;
    return state.focusedIndex;
  },
};
