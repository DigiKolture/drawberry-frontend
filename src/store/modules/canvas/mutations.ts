import { MutationTree } from "vuex";
import {
  CanvasSaveStatus,
  CanvasState,
  CurrentHoverElementType,
  ProjectStyle,
  UpdatedComponent,
} from "@/store/modules/canvas/types";
import { updateDom } from "@/composables/canvas/update_dom";
import { canvas } from "@/composables/canvas/canvas";
import { helpers } from "@/composables/helpers";

const { updateElementDom } = updateDom();
const { updateComponentBorder } = canvas();
const { isObject } = helpers();

export const mutations: MutationTree<CanvasState> = {
  SET_FOCUSED_ELEMENT(state: CanvasState, data: object) {
    state.focusedElement = data;
    return state.focusedElement;
  },
  SET_FOCUSED_PARENT_ELEMENT(state: CanvasState, data: object) {
    state.focusedParentElement = data;
    return state.focusedParentElement;
  },
  SET_FOCUSED_CHILDREN_ELEMENTS(state: CanvasState, data: any[]) {
    state.focusedChildrenElements = data;
    return state.focusedChildrenElements;
  },
  SET_WORKSPACE_COMPONENTS(state: CanvasState, payload) {
    // Whenever the SET_WORKSPACE_COMPONENTS is called with just components update the save status to UPDATED
    if (isObject(payload)) {
      state.workspaceComponents = payload.components;
      state.saveStatus = payload.saveStatus;
    } else {
      state.workspaceComponents = payload;
      state.saveStatus = CanvasSaveStatus.UPDATED;
    }
    return state.workspaceComponents;
  },
  SET_HAS_WORKSPACE_COMPONENTS(state: CanvasState, data: boolean) {
    state.hasWorkspaceComponent = data;
    return state.hasWorkspaceComponent;
  },
  SET_GENERAL_STYLE(state: CanvasState, data: ProjectStyle) {
    state.generalStyle = data;
    return state.style;
  },
  SET_STYLE(state: CanvasState, data: ProjectStyle) {
    state.style = data;
    state.saveStatus = CanvasSaveStatus.UPDATED;
    return state.style;
  },
  SET_DEFAULT_STYLE(state: CanvasState) {
    state.style = {
      layout: "",
      backgroundColor: "",
      fontFamily: "",
      buttonColor: "",
      backgroundImage: "",
      previewText: "",
    };
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
  SET_SAVE_STATUS(state: CanvasState, data: CanvasSaveStatus) {
    state.saveStatus = data;
    return state.saveStatus;
  },
  SET_CURRENT_HOVER_ELEMENT(state: CanvasState, data: CurrentHoverElementType) {
    state.currentHoverElement = data;
    return state.currentHoverElement;
  },
  SET_UPDATED_COMPONENTS(state: CanvasState, data: UpdatedComponent[]) {
    state.updatedComponents = data;
    return state.updatedComponents;
  },
  UPDATE_FOCUSED_JSON_AND_DOM2(state: CanvasState, data: object): any {
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
    state.saveStatus = CanvasSaveStatus.UPDATED;
    return state.focusedElement;
  },

  UPDATE_FOCUSED_JSON_AND_DOM(state: CanvasState, element: object): any {
    const workspaceComponents = state.workspaceComponents;

    if (state.focusedIndex === null) {
      return element;
    }

    const projectComponentItem = workspaceComponents[state.focusedIndex];

    const jsonIndex = projectComponentItem.json.findIndex(
      (el: any) => el.id === (element as any).id
    );

    if (jsonIndex !== -1) {
      projectComponentItem.json[jsonIndex] = element;
    }

    const html = projectComponentItem.html;
    projectComponentItem.html = updateElementDom(html, element);

    state.workspaceComponents = workspaceComponents;
    state.saveStatus = CanvasSaveStatus.UPDATED;

    return element;
  },

  UPDATE_ELEMENT_IN_COMPONENTS_DOM(
    state: CanvasState,
    { elementId, componentIndex }
  ): any {
    const workspaceComponents = state.workspaceComponents;

    const projectComponentItem = workspaceComponents[componentIndex];

    const jsonIndex = projectComponentItem.json.findIndex(
      (el: any) => el.id === elementId
    );

    if (jsonIndex < 0) {
      return;
    }

    const html = projectComponentItem.html;
    projectComponentItem.html = updateElementDom(
      html,
      projectComponentItem.json[jsonIndex]
    );

    state.workspaceComponents = workspaceComponents;
    state.saveStatus = CanvasSaveStatus.UPDATED;

    return projectComponentItem.json[jsonIndex];
  },

  UPDATE_FIRST_PROJECT_COMPONENTS_STYLE(
    state: CanvasState,
    layout: string
  ): any {
    for (const workspaceComponent of state.workspaceComponents) {
      const { html, json } = updateComponentBorder(
        layout,
        workspaceComponent.json,
        workspaceComponent.html
      );

      workspaceComponent.html = html;
      workspaceComponent.json = json;
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
  SET_DROP_LOADING(state: CanvasState, data: boolean) {
    state.dropLoading = data;
    return state.dropLoading;
  },
  SET_SAVED_COLORS(state: CanvasState, data: string[]) {
    state.savedColors = data;
    return state.savedColors;
  },
};
