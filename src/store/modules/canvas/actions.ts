import { ActionTree } from "vuex";
import { CanvasState } from "@/store/modules/canvas/types";
import { RootState } from "@/store/types";
// import AxiosClient from "@/services/api";

// const baseUrl = "/components";

export const actions: ActionTree<CanvasState, RootState> = {
  // getComponentItems({ commit }, componentId: string): Promise<void> {
  //   return AxiosClient.get(
  //     `${baseUrl}/${componentId}/items?sort=created_at&order=desc`
  //   )
  //     .then((res: any) => {
  //       const data = res.data;
  //       commit("SET_COMPONENT_ITEMS", data.data.rows);
  //       return res.data;
  //     })
  //     .catch((err: any): any => {
  //       if (err instanceof Error) {
  //         const message = err.message;
  //         return Promise.reject(new Error(message));
  //       }
  //     });
  // },
};
