import { ActionTree } from "vuex";
import {
  CanvasSaveStatus,
  CanvasState,
  ProjectStyle,
} from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import router from "@/router";
import { canvas } from "@/composables/canvas/canvas";
import ObjectId from "bson-objectid";
import { helpers } from "@/composables/helpers";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
import { focus } from "@/composables/canvas/focus";
import { project } from "@/composables/project/project";
import store from "@/store";

const { undoStack } = history();
const { updateComponentBorder, removeClasses } = canvas();
const {
  createProjectComponentObj,
  duplicateProjectComponentObj,
  formatProjectComponents,
} = project();
const { copyObject } = helpers();
const { updateHistory } = history();
const { scrollTo } = focus();

export const actions: ActionTree<CanvasState, RootState> = {
  getProjectComponentItems(
    { state, commit, getters, dispatch },
    projectId: string
  ): Promise<void> {
    dispatch("prepareCanvas");
    const sidebarNavContentVal = getters.sidebarNavContent;
    return AxiosClient.get(`/projects/${projectId}`)
      .then((res: any) => {
        const data = res.data;
        commit("projects/SET_PROJECT", data.data.project, { root: true });
        const fromPreview = state.navigatedFromPreview;
        if (!fromPreview) {
          commit("history/RESET_HISTORY_STACK", {}, { root: true });
        }
        commit("SET_WORKSPACE_COMPONENTS", {
          components: formatProjectComponents(data.data.project.components),
          saveStatus: CanvasSaveStatus.SAVED,
        });
        const style = data.data.project.style;
        commit("SET_STYLE", {
          style: { ...style },
          saveStatus: CanvasSaveStatus.SAVED,
        });
        commit("SET_GENERAL_STYLE", { ...style });

        const hasWorkspaceComponent =
          data.data.project.components &&
          data.data.project.components.length > 0;

        commit("SET_HAS_WORKSPACE_COMPONENTS", hasWorkspaceComponent);
        if (hasWorkspaceComponent) {
          commit("SET_SIDEBAR_NAVBAR_CONTENT", sidebarNavContentVal);
        }

        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  getGoogleFonts({ commit }): Promise<void> {
    return AxiosClient.get("/relays/google/fonts")
      .then((res: any) => {
        const data = res.data;
        commit("SET_GOOGLE_FONTS", data.data.fonts);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  updateProjectComponent(
    _,
    { projectId, projectComponentItemId, data }
  ): Promise<void> {
    return AxiosClient.put(
      `/projects/${projectId}/components/${projectComponentItemId}`,
      data
    )
      .then((res: any) => {
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  async updateProjectComponentsAndStyles({ state, commit }): Promise<void> {
    // if (!hasProjectChanged()) {
    //   return;
    // }
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    const projectComponents = state.workspaceComponents.map(
      (workspaceComponent) => {
        return {
          projectComponentItemId: workspaceComponent.id,
          json: removeClasses(workspaceComponent.json),
          componentItemId: workspaceComponent.componentItem,
          defaultJson: workspaceComponent.defaultJson,
          html: workspaceComponent.defaultHtml,
          defaultHtml: workspaceComponent.defaultHtml,
          componentItemHistoryId: workspaceComponent.componentItemHistory,
          version: workspaceComponent.version,
        };
      }
    );
    const style: ProjectStyle = state.style;
    return AxiosClient.put(`/projects/${projectId}/components/styles`, {
      projectComponents,
      style,
      histories: undoStack.value,
    })
      .then((res: any) => {
        commit("SET_SAVE_STATUS", CanvasSaveStatus.SAVED);
        commit("SET_UPDATED_COMPONENTS", []); // TODO: Check if this is still relevant
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  async updateProjectComponentsAndStylesWithLLM({
    state,
    commit,
  }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    const projectComponents = state.workspaceComponents.map(
      (workspaceComponent) => {
        return {
          projectComponentItemId: workspaceComponent.id,
          json: removeClasses(workspaceComponent.json),
          componentItemId: workspaceComponent.componentItem,
          defaultJson: workspaceComponent.defaultJson,
          html: workspaceComponent.defaultHtml,
          defaultHtml: workspaceComponent.defaultHtml,
          componentItemHistoryId: workspaceComponent.componentItemHistory,
          version: workspaceComponent.version,
        };
      }
    );
    const style: ProjectStyle = state.style;
    return AxiosClient.put(`/projects/${projectId}/components/styles/llm`, {
      prompt: state.llmPrompt,
      projectComponents,
      style,
      // histories: undoStack.value,
    })
      .then((res: any) => {
        commit("SET_SAVE_STATUS", CanvasSaveStatus.SAVED);
        commit("SET_UPDATED_COMPONENTS", []); // TODO: Check if this is still relevant
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  async duplicateProjectComponent(
    { state, commit, dispatch },
    { projectComponentItem, positionIndex }
  ): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;
    const newProjectComponentId = new ObjectId().toHexString();

    const projectComponentCleaned = JSON.parse(
      JSON.stringify(projectComponentItem)
    );

    // TODO: Might remove removeClasses since I am now checking if the current index is selected or hovered on before showing the border

    const projectComponent = duplicateProjectComponentObj(
      newProjectComponentId,
      projectId,
      projectComponentCleaned
    );

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE,
      projectComponent,
      positionIndex,
      workspaceComponentItemId: newProjectComponentId,
    });

    state.workspaceComponents.splice(positionIndex, 0, projectComponent);
    commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);

    //TODO: Might remove this temp since we are calling API every 5 secs
    dispatch("updateProjectComponentsAndStyles");
  },
  deleteProjectComponent(_, { projectComponentItemId }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    return AxiosClient.delete(
      `/projects/${projectId}/components/${projectComponentItemId}`
    )
      .then((res: any) => {
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  updateFocusedElement({ state, commit }, element) {
    if (state.focusedIndex === null || state.focusedElement === null) return;

    //Update DOM before the API (Just to prevent waiting for changes)
    commit("UPDATE_FOCUSED_JSON_AND_DOM", element);
    // Not sure why this was added, removing for now because it is causing multiple scrolls
    setTimeout(() => {
      if (state.focusedIndex !== null) {
        // scrollTo(state.focusedIndex, element.id);
      }
    }, 0);
    // const projectComponentItem = state.workspaceComponents[state.focusedIndex];
    // pushComponentsElementsUpdates(element, projectComponentItem);
  },

  async updateProjectStyle({ commit }, style): Promise<void> {
    commit("SET_STYLE", style);
  },
  async updateFirstProjectComponentsStyles(
    { commit },
    { projectId, style }
  ): Promise<void> {
    commit("UPDATE_FIRST_PROJECT_COMPONENTS_STYLE", style);
    return AxiosClient.put(`/projects/${projectId}/components/first/styles`, {
      style,
    })
      .then((res: any) => {
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  uploadImageToCloudinary(_, data): Promise<void> {
    return AxiosClient.post(`/utils/upload/image`, data, { timeout: 30000 })
      .then((res: any) => {
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  async setSidebarNavbarContent({ commit }, content): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        commit("SET_SIDEBAR_NAVBAR_CONTENT", content);
        resolve();
      });
    });
  },

  prepareCanvas({ commit }): void {
    commit("SET_HAS_WORKSPACE_COMPONENTS", false);
    commit("SET_SIDEBAR_NAVBAR_CONTENT", null);
    commit("SET_DEFAULT_STYLE");
    commit("SET_UPDATED_COMPONENTS", []);
    commit("projects/SET_PROJECT", null, { root: true });
  },
};
