import { ActionTree } from "vuex";
import { CanvasState, ProjectStyle } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { updateDom } from "@/composables/canvas/update_dom";
import router from "@/router";
import { canvas } from "@/composables/canvas/canvas";

const { updateComponentItemDom } = updateDom();
const { updateElementDom } = updateDom();
const { hasProjectChanged, pushComponentsElementsUpdates } = canvas();

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
        commit("SET_WORKSPACE_COMPONENTS", data.data.project.components);
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
  storeProjectComponent({ state, commit }, { data }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    return AxiosClient.post(`/projects/${projectId}/components`, data)
      .then((res: any) => {
        commit("SET_HAS_WORKSPACE_COMPONENTS", true);

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
    if (!hasProjectChanged()) {
      console.log("<<<<<<< hasnt changed");
      return;
    }
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;

    const projectComponents = state.updatedComponents;
    const style: ProjectStyle = state.style;
    return AxiosClient.put(`/projects/${projectId}/components/styles`, {
      projectComponents,
      style,
    })
      .then((res: any) => {
        // commit("SET_UPDATED_COMPONENTS", []);
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

        if (state.workspaceComponents.length == 0) {
          commit("SET_HAS_WORKSPACE_COMPONENTS", false);
        }
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
    const projectComponentItem = state.workspaceComponents[state.focusedIndex];

    pushComponentsElementsUpdates(state.focusedElement, projectComponentItem);

    // dispatch("updateProjectComponent", {
    //   projectId,
    //   projectComponentItemId: projectComponentItem.id,
    //   set: false,
    //   data: {
    //     elements: [
    //       {
    //         id: focusedElement.id,
    //         attributes: focusedElement.attributes,
    //         innerHtml: focusedElement.innerHtml,
    //       },
    //     ],
    //   },
    // });
  },

  updateFocusedParentElement({ state, commit }, element) {
    if (
      state.focusedIndex === null ||
      state.focusedElement === null ||
      state.focusedParentElement === null
    )
      return;

    //Update DOM before the API (Just to prevent waiting for changes)
    commit("UPDATE_FOCUSED_PARENT_JSON_AND_DOM", element);
    const projectComponentItem = state.workspaceComponents[state.focusedIndex];

    pushComponentsElementsUpdates(
      state.focusedParentElement,
      projectComponentItem
    );
  },
  async updateProjectStyle({ commit }, style): Promise<void> {
    commit("SET_STYLE", style);
    // const root: any = rootState;
    // const projectId: string = root.projects.projectId;
    //
    // await store.dispatch("projects/updateProject", {
    //   id: projectId,
    //   data: { style },
    // });
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

  prepareCanvas({ commit }): void {
    commit("SET_HAS_WORKSPACE_COMPONENTS", false);
    commit("SET_SIDEBAR_NAVBAR_CONTENT", null);
    commit("SET_DEFAULT_STYLE");
    // commit("SET_UPDATED_COMPONENTS", []);
    commit("projects/SET_PROJECT", null, { root: true });
  },
};
