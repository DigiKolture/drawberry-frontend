import { ActionTree } from "vuex";
import { ProjectState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { updateDom } from "@/composables/canvas/update_dom";
import router from "@/router";

const baseUrl = "/projects";
const { updateElementDom } = updateDom();

export const actions: ActionTree<ProjectState, RootState> = {
  getProjects({ commit }): Promise<void> {
    const params = {
      sort: "-updatedAt",
    };
    return AxiosClient.get(`${baseUrl}`, { params })
      .then((res: any) => {
        const data = res.data;
        commit("SET_PROJECTS", data.data.rows);
        commit("SET_FILTERED_PROJECTS", data.data.rows);
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
    return AxiosClient.get(`${baseUrl}/${projectId}/preview`)
      .then((res: any) => {
        const project = res.data.data.project;

        // const dang = project.components.map((componentItem: any) => {
        //   console.log({ componentItem });
        //   const json = componentItem.json;
        //   let html = componentItem.json;
        //   for (const elementJson of json) {
        //     if (!elementJson.attributes.style.value) continue;
        //     html = updateElementDom(html, elementJson);
        //   }
        //
        //   return { html };
        // });

        // console.log({ dang });

        return res.data.data.project;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  async previewProjectByEmail(_, body: { email: string }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;
    return AxiosClient.post(`${baseUrl}/${projectId}/preview/email`, body)
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
  updateProjectName({ dispatch }, { data, id }): Promise<void> {
    return AxiosClient.put(`${baseUrl}/${id}`, data)
      .then((res: any) => {
        dispatch("getProjects");
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  duplicateProject({ commit, dispatch }, { data, id }): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${id}/duplicate`, data)
      .then((res: any) => {
        dispatch("getProjects");
        return res.data.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  deleteProject({ commit, dispatch }, projectId: string): Promise<void> {
    return AxiosClient.delete(`${baseUrl}/${projectId}`)
      .then((res: any) => {
        dispatch("getProjects");
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
