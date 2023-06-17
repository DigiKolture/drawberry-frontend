import { ActionTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { updateDom } from "@/composables/canvas/update_dom";

// const baseUrl = "/components";

const { updateComponentItemDom } = updateDom();

export const actions: ActionTree<CanvasState, RootState> = {
  getProjectComponentItems({ commit }, projectId: string): Promise<void> {
    return AxiosClient.get(`/projects/${projectId}`)
      .then((res: any) => {
        const data = res.data;
        commit("projects/SET_PROJECT", data.data.project, { root: true });
        commit("SET_WORKSPACE_COMPONENTS", data.data.project.components);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  storeProjectComponent({ state, commit }, { projectId, data }): Promise<void> {
    return AxiosClient.post(`/projects/${projectId}/components`, data)
      .then((res: any) => {
        // dispatch("getProjectComponentItems", projectId);
        const data = res.data;
        const component = data.data.component;
        state.workspaceComponents.push(component);
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
  updateProjectStyle({ commit }, { projectId, style }): Promise<void> {
    commit("UPDATE_PROJECT_STYLE", style);
    return AxiosClient.put(`/projects/${projectId}/style`, {
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
};
