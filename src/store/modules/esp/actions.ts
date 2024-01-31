import { ActionTree } from "vuex";
import { ESPState } from "@/store/modules/esp/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import router from "@/router";

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
      esp === "mailchimp" && process.env.VUE_APP_ENVIRONMENT === "local"
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
    return AxiosClient.post(`${baseUrl}/${esp}/callback`, {
      code: data.code,
      query: data,
    })
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

  exportProject({ commit }, { esp, projectId }): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${esp}/project/${projectId}/export`)
      .then((res: any) => {
        const data = res.data.data;
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  downloadProject({ commit }): Promise<void> {
    const currentRoute: any = router.currentRoute;
    const projectId = currentRoute._value.params.id;
    return AxiosClient.get(`${baseUrl}/project/${projectId}/download`)
      .then((res: any) => {
        const { html, name } = res.data.data;

        const blob = new Blob([html], { type: "text/html" });
        const link = document.createElement("a");

        link.download = `${name}.html`;
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  disconnectESP({ commit }, { esp }): Promise<void> {
    return AxiosClient.delete(`${baseUrl}/${esp}/disconnect`)
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
