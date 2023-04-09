import { MutationTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import store from "@/store";

export const mutations: MutationTree<CanvasState> = {
  SET_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    // console.log({ data });
    state.focusedElement = data;
    const workspaceComponents = store.getters["components/myComponentItems"];
    if (state.focusedIndex !== null) {
      const componentItem = workspaceComponents[state.focusedIndex];

      const data2: any = state.focusedElement;
      const jsonIndex = componentItem.json.findIndex(
        (el: any) => el.id == data2.id
      );
      componentItem.json[jsonIndex] = state.focusedElement;
      store.commit("components/SET_MY_COMPONENT_ITEMS", workspaceComponents);
    }
    return state.focusedElement;
  },
  SET_FOCUSED_INDEX(state: CanvasState, data: number) {
    state.focusedIndex = data;
    return state.focusedIndex;
  },
};
