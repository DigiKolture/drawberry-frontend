import { ActionTree } from "vuex";
import { ESPState } from "@/store/modules/esp/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/esp";

export const actions: ActionTree<ESPState, RootState> = {
  getESPs({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}`)
      .then((res: any) => {
        const data = res.data.data;
        commit("SET_ESPS", data.esps);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  getESPRedirectURL({ commit }, esp): Promise<void> {
    const baseURL =
      esp === "mailchimp"
        ? "http://127.0.0.1:8081"
        : process.env.VUE_APP_BASE_URL;
    const redirectUrl = `${baseURL}/esp/${esp}/callback`;
    return AxiosClient.get(
      `${baseUrl}/${esp}/authenticate?redirectUrl=${redirectUrl}`
    )
      .then((res: any) => {
        const data = res.data.data;
        console.log({ data });
        window.location.href = data.authenticateUrl;
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  connectESP({ commit }, { esp, data }): Promise<void> {
    const redirectUrl = `${process.env.VUE_APP_BASE_URL}/esp/${esp}/callback`;
    return AxiosClient.post(
      `${baseUrl}/${esp}/callback?redirectUrl=${redirectUrl}`,
      { code: data.code, query: data }
    )
      .then((res: any) => {
        const data = res.data.data;
        return res.data;
      })
      .catch((err: any): any => {
        //  TODO: Redirect back to cnavas incase of error
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
};
