import { ActionTree } from "vuex";
import { FolderState } from "@/store/modules/folders/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/folders";

export const actions: ActionTree<FolderState, RootState> = {
  getFolders({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}`)
      .then((res: any) => {
        const data = res.data;
        commit("SET_FOLDERS", data.data.rows);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  getFolderProjects({ commit }, folderId): Promise<void> {
    return AxiosClient.get(`${baseUrl}/${folderId}/projects`)
      .then((res: any) => {
        const data = res.data;
        commit("projects/SET_PROJECTS", data.data.rows, { root: true });
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  storeFolder({ commit, dispatch }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}`, data)
      .then((res: any) => {
        dispatch("getFolders");
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
