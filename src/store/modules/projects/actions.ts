import { ActionTree } from "vuex";
import { ProjectState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/projects";

export const actions: ActionTree<ProjectState, RootState> = {
  getProjects({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}`)
      .then((res: any) => {
        const data = res.data;
        commit("SET_PROJECTS", data.data.rows);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  getProjectComponentsForPreview(_, projectId: string): Promise<void> {
    return AxiosClient.get(`${baseUrl}/${projectId}`)
      .then((res: any) => {
        return res.data.data.project;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  storeProject({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}`, data)
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

  updateProject({ commit }, { data, id }): Promise<void> {
    return AxiosClient.put(`${baseUrl}/${id}`, data)
      .then((res: any) => {
        commit("SET_PROJECT", res.data.data.project);
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  duplicateProject({ commit }, { data, id }): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${id}/duplicate`, data)
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

  deleteProject({ commit }, projectId: string): Promise<void> {
    return AxiosClient.delete(`${baseUrl}/${projectId}`)
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
  undoDeletedProject({ commit }, projectId: string): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${projectId}/undo/delete`)
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
