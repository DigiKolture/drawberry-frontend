import { ActionTree } from "vuex";
import { ConnectorsState } from "@/store/modules/connectors/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import router from "@/router";

const baseUrl = "/connectors";

/** Surface the backend's message so the UI can show a clear error. */
const toError = (err: any): Error => {
  const message =
    err?.response?.data?.message ||
    (err instanceof Error ? err.message : "Something went wrong");
  return new Error(message);
};

export const actions: ActionTree<ConnectorsState, RootState> = {
  fetchCatalog({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}/catalog`)
      .then((res: any) => {
        commit("SET_CATALOG", res.data.data.catalog);
        return res.data;
      })
      .catch((err: any) => Promise.reject(toError(err)));
  },

  fetchConnections({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}`)
      .then((res: any) => {
        commit("SET_CONNECTIONS", res.data.data.connections);
        return res.data;
      })
      .catch((err: any) => Promise.reject(toError(err)));
  },

  connectWithApiKey({ dispatch }, { connector, fields }): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${connector}/connect`, fields)
      .then(async (res: any) => {
        await dispatch("fetchConnections");
        return res.data;
      })
      .catch((err: any) => Promise.reject(toError(err)));
  },

  // OAuth connectors: kick off the redirect flow. API-key connectors don't use
  // this — it's here so the store covers both auth kinds behind one interface.
  getRedirectURL(_ctx, connector): Promise<void> {
    return AxiosClient.get(`${baseUrl}/${connector}/authenticate`)
      .then((res: any) => {
        window.location.href = res.data.data.authenticateUrl;
        return res.data;
      })
      .catch((err: any) => Promise.reject(toError(err)));
  },

  connectOAuth(_ctx, { connector, data }): Promise<void> {
    return AxiosClient.post(`${baseUrl}/${connector}/callback`, {
      code: data.code,
      query: data,
    })
      .then((res: any) => res.data)
      .catch((err: any) => Promise.reject(toError(err)));
  },

  exportProject(_ctx, { connector, projectId }): Promise<void> {
    return AxiosClient.post(
      `${baseUrl}/${connector}/project/${projectId}/export`
    )
      .then((res: any) => res.data)
      .catch((err: any) => Promise.reject(toError(err)));
  },

  downloadProject(): Promise<void> {
    const projectId = router.currentRoute.value.params.id;
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
      .catch((err: any) => Promise.reject(toError(err)));
  },

  disconnect({ dispatch }, { connector }): Promise<void> {
    return AxiosClient.delete(`${baseUrl}/${connector}/disconnect`)
      .then(async (res: any) => {
        await dispatch("fetchConnections");
        return res.data;
      })
      .catch((err: any) => Promise.reject(toError(err)));
  },
};
