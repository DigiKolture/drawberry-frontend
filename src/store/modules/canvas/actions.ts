import { ActionTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

// const baseUrl = "/components";

export const actions: ActionTree<CanvasState, RootState> = {
  getProjectComponentItems({ commit }, projectId: string): Promise<void> {
    return AxiosClient.get(`/projects/${projectId}`)
      .then((res: any) => {
        const data = res.data;
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
  storeProjectComponent({ dispatch }, { projectId, data }): Promise<void> {
    return AxiosClient.post(`/projects/${projectId}/components`, data)
      .then((res: any) => {
        dispatch("getProjectComponentItems", projectId);
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
        dispatch("getProjectComponentItems", projectId);
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
};
