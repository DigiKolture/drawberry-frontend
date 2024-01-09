import { ActionTree } from "vuex";
import { ComponentState } from "@/store/modules/components/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/components";

export const actions: ActionTree<ComponentState, RootState> = {
  getComponents({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}?sort=created_at&order=desc`)
      .then((res: any) => {
        const data = res.data;
        commit("SET_COMPONENTS", data.data.rows);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  getComponentItems({ commit }, componentId: string): Promise<void> {
    return AxiosClient.get(
      `${baseUrl}/${componentId}/items?sort=name&order=desc`
    )
      .then((res: any) => {
        const data = res.data;
        commit("SET_COMPONENT_ITEMS", data.data.rows);
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
