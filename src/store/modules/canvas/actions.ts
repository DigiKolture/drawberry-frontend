import { ActionTree } from "vuex";
import {
  CanvasEditableTypes,
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

const { updateComponentBorder, removeClasses } = canvas();
const { copyObject } = helpers();
const { updateHistory } = history();
const { scrollTo } = focus();

export const actions: ActionTree<CanvasState, RootState> = {
  getProjectComponentItems(
    { commit, getters, dispatch },
    projectId: string
  ): Promise<void> {
    dispatch("prepareCanvas");
    const sidebarNavContentVal = getters.sidebarNavContent;
    return AxiosClient.get(`/projects/${projectId}`)
      .then((res: any) => {
        const data = res.data;
        commit("projects/SET_PROJECT", data.data.project, { root: true });
        commit("history/RESET_HISTORY_STACK", {}, { root: true });
        commit("SET_WORKSPACE_COMPONENTS", {
          components: data.data.project.components,
          saveStatus: CanvasSaveStatus.SAVED,
        });
        const style = data.data.project.style;
        commit("SET_STYLE", { ...style });
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
  async addComponentToProject(
    { state, commit, dispatch },
    { data }
  ): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    const projectComponentId = new ObjectId().toHexString();
    // const componentItem = data.componentItem;
    const componentItem = copyObject(data.componentItem);

    const { html, json } = updateComponentBorder(
      state.style.layout,
      componentItem.json,
      componentItem.html
    );

    const projectComponent = {
      _id: projectComponentId,
      id: projectComponentId,
      project: projectId,
      componentItem: componentItem.id,
      json,
      html,
      defaultJson: componentItem.json,
      defaultHtml: componentItem.html,
    };

    commit("SET_HAS_WORKSPACE_COMPONENTS", true);

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_ADD,
      projectComponent,
      positionIndex: data.positionIndex,
      workspaceComponentItemId: projectComponentId,
    });

    state.workspaceComponents.splice(data.positionIndex, 0, projectComponent);
    commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);

    dispatch("updateProjectComponentsAndStyles").then();
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
        };
      }
    );
    const style: ProjectStyle = state.style;
    return AxiosClient.put(`/projects/${projectId}/components/styles`, {
      projectComponents,
      style,
    })
      .then((res: any) => {
        commit("SET_SAVE_STATUS", CanvasSaveStatus.SAVED);
        commit("SET_UPDATED_COMPONENTS", []);
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

    const projectComponent = {
      _id: newProjectComponentId,
      id: newProjectComponentId,
      project: projectId,
      componentItem: projectComponentCleaned.componentItem,
      json: removeClasses(projectComponentCleaned.json),
      html: projectComponentCleaned.html,
      defaultHtml: projectComponentCleaned.defaultHtml,
      defaultJson: projectComponentCleaned.defaultJson,
    };

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE,
      projectComponent,
      positionIndex,
      workspaceComponentItemId: newProjectComponentId,
    });

    state.workspaceComponents.splice(positionIndex, 0, projectComponent);
    commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);

    dispatch("updateProjectComponentsAndStyles");
  },
  deleteProjectComponent(
    { state, commit, dispatch },
    { projectId, projectComponentItemId, positionIndex }
  ): Promise<void> {
    const projectComponent = state.workspaceComponents[positionIndex];

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_DELETE,
      projectComponent,
      positionIndex,
      workspaceComponentItemId: projectComponentItemId,
    });

    state.workspaceComponents.splice(positionIndex, 1);
    commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);

    if (state.workspaceComponents.length == 0) {
      commit("SET_HAS_WORKSPACE_COMPONENTS", false);
    }
    return AxiosClient.delete(
      `/projects/${projectId}/components/${projectComponentItemId}`
    )
      .then((res: any) => {
        dispatch("updateProjectComponentsAndStyles");
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
    setTimeout(() => {
      if (state.focusedIndex !== null) {
        scrollTo(state.focusedIndex, element.id);
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
