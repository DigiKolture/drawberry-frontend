import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { PreviewState } from "@/store/modules/preview/types";

const baseUrl = "/projects";

export const actions: ActionTree<PreviewState, RootState> = {
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
};
