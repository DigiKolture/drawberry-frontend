import { MutationTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import store from "@/store";
import { updateDom } from "@/composables/canvas/update_dom";

export const mutations: MutationTree<CanvasState> = {
  SET_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    state.focusedElement = data;
    return state.focusedElement;
  },
  UPDATE_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    state.focusedElement = data;
    const workspaceComponents = store.getters["components/myComponentItems"];
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
    store.commit("components/SET_MY_COMPONENT_ITEMS", workspaceComponents);
    return state.focusedElement;
  },
  SET_FOCUSED_INDEX(state: CanvasState, data: number) {
    state.focusedIndex = data;
    return state.focusedIndex;
  },
};
