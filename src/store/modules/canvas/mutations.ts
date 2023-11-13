import { MutationTree } from "vuex";
import {
  CanvasState,
  CurrentHoverElementType,
  ProjectStyle,
} from "@/store/modules/canvas/types";
import { updateDom } from "@/composables/canvas/update_dom";
const { updateElementDom } = updateDom();

export const mutations: MutationTree<CanvasState> = {
  SET_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    state.focusedElement = data;
    return state.focusedElement;
  },
  SET_WORKSPACE_COMPONENTS(state: CanvasState, data: any[]) {
    state.workspaceComponents = data;
    return state.workspaceComponents;
  },
  SET_HAS_WORKSPACE_COMPONENTS(state: CanvasState, data: boolean) {
    state.hasWorkspaceComponent = data;
    return state.hasWorkspaceComponent;
  },
  SET_STYLE(state: CanvasState, data: ProjectStyle) {
    state.style = data;
    return state.style;
  },
  SET_GOOGLE_FONTS(state: CanvasState, data: any[]) {
    state.googleFonts = data;
    return state.googleFonts;
  },
  SET_FONT_WEIGHTS(state: CanvasState, data: number[]) {
    state.fontWeights = data;
    return state.fontWeights;
  },
  SET_CURRENT_HOVER_ELEMENT(state: CanvasState, data: CurrentHoverElementType) {
    state.currentHoverElement = data;
    return state.currentHoverElement;
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

    projectComponentItem.html = updateElementDom(html, elementJson);
    state.workspaceComponents = workspaceComponents;
    return state.focusedElement;
  },
  UPDATE_FIRST_PROJECT_COMPONENTS_STYLE(
    state: CanvasState,
    style: object
  ): any {
    for (const workspaceComponent of state.workspaceComponents) {
      const element = workspaceComponent.json[0];
      element.attributes.style.value = {
        ...element.attributes.style.value,
        ...style,
      };

      workspaceComponent.html = updateElementDom(
        workspaceComponent.html,
        element
      );
    }
    return state.workspaceComponents;
  },
  UPDATE_ALL_PROJECT_COMPONENTS_STYLE(state: CanvasState, style: object): any {
    for (const workspaceComponent of state.workspaceComponents) {
      for (const element of workspaceComponent.json) {
        for (const [property, value] of Object.entries(style))
          if (
            element.attributes.style.value &&
            property in element.attributes.style.value
          ) {
            element.attributes.style.value[property] = value;
          }
        //TODO: Create an update element dom for array of elements
        workspaceComponent.html = updateElementDom(
          workspaceComponent.html,
          element
        );
      }
    }
    return state.workspaceComponents;
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
