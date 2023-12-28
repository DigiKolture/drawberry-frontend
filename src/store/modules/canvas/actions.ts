import { ActionTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { updateDom } from "@/composables/canvas/update_dom";
import store from "@/store";
import router from "@/router";

const { updateComponentItemDom } = updateDom();
const { updateElementDom } = updateDom();

export const actions: ActionTree<CanvasState, RootState> = {
  getProjectComponentItems(
    { commit, getters },
    projectId: string
  ): Promise<void> {
    commit("SET_HAS_WORKSPACE_COMPONENTS", false);
    const sidebarNavContentVal = getters.sidebarNavContent;
    commit("SET_SIDEBAR_NAVBAR_CONTENT", null);
    return AxiosClient.get(`/projects/${projectId}`)
      .then((res: any) => {
        const data = res.data;
        commit("projects/SET_PROJECT", data.data.project, { root: true });
        commit("SET_WORKSPACE_COMPONENTS", data.data.project.components);
        commit("SET_STYLE", data.data.project.style);

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
  storeProjectComponent({ state, commit }, { data }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    return AxiosClient.post(`/projects/${projectId}/components`, data)
      .then((res: any) => {
        // dispatch("getProjectComponentItems", projectId);
        const component = res.data.data.component;
        component.html = updateElementDom(component.html, component.json[0]);

        state.workspaceComponents.splice(data.positionIndex, 0, component);
        commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  updateProjectComponent(
    { dispatch },
    { projectId, projectComponentItemId, data }
  ): Promise<void> {
    return AxiosClient.put(
      `/projects/${projectId}/components/${projectComponentItemId}`,
      data
    )
      .then((res: any) => {
        // if (set) {
        //   dispatch("getProjectComponentItems", projectId);
        // }
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  duplicateProjectComponent(
    { state, commit },
    { projectId, projectComponentItemId, positionIndex }
  ): Promise<void> {
    return AxiosClient.post(
      `/projects/${projectId}/duplicate/components/${projectComponentItemId}`
    )
      .then((res: any) => {
        const data = res.data;
        const component = updateComponentItemDom(data.data.component);
        state.workspaceComponents.splice(positionIndex, 0, component);
        commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  deleteProjectComponent(
    { state, commit },
    { projectId, projectComponentItemId, positionIndex }
  ): Promise<void> {
    return AxiosClient.delete(
      `/projects/${projectId}/components/${projectComponentItemId}`
    )
      .then((res: any) => {
        state.workspaceComponents.splice(positionIndex, 1);
        commit("SET_WORKSPACE_COMPONENTS", state.workspaceComponents);
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  updateFocusedElement({ state, dispatch, commit, rootState }, element) {
    if (state.focusedIndex === null || state.focusedElement === null) return;

    //Update DOM before the API (Just to prevent waiting for changes)
    commit("UPDATE_FOCUSED_JSON_AND_DOM", element);
    const projectComponentItem = state.workspaceComponents[state.focusedIndex];
    const focusedElement: any = state.focusedElement;
    const root: any = rootState;
    const projectId: string = root.projects.projectId;

    dispatch("updateProjectComponent", {
      projectId,
      projectComponentItemId: projectComponentItem.id,
      set: false,
      data: {
        elements: [
          {
            id: focusedElement.id,
            attributes: focusedElement.attributes,
            innerHtml: focusedElement.innerHtml,
          },
        ],
      },
    });
  },
  async updateProjectStyle({ commit, rootState }, style): Promise<void> {
    commit("SET_STYLE", style);
    const root: any = rootState;
    const projectId: string = root.projects.projectId;

    await store.dispatch("projects/updateProject", {
      id: projectId,
      data: { style },
    });
  },
  updateFirstProjectComponentsStyles(
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
  updateAllProjectComponentsStyles(
    { commit },
    { projectId, style }
  ): Promise<void> {
    commit("UPDATE_ALL_PROJECT_COMPONENTS_STYLE", style);
    return AxiosClient.put(`/projects/${projectId}/components/all/styles`, {
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
    return AxiosClient.post(`/utils/upload/image`, data)
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
};
