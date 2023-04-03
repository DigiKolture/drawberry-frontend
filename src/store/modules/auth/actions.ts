import { ActionTree } from "vuex";
import { AuthState } from "@/store/modules/auth/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/auth";

export const actions: ActionTree<AuthState, RootState> = {
  login({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}/login`, data)
      .then((res: any) => {
        const data = res.data;
        if (!data.error) {
          const { tokens, user } = data.data;
          commit("SET_JWT", tokens.access.token);
          commit("SET_AUTH_USER", user);
          localStorage.setItem("refresh-token", tokens.refresh.token);
        }
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  register({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}/register`, data)
      .then((res: any) => {
        const data = res.data;
        if (!data.error) {
          const { tokens, user } = data.data;
          commit("SET_JWT", tokens.access.token);
          commit("SET_AUTH_USER", user);
          localStorage.setItem("refresh-token", tokens.refresh.token);
        }
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  getUser({ commit }): void | Promise<void> {
    return AxiosClient.get(`${baseUrl}/user`)
      .then((res: any) => {
        commit("SET_AUTH_USER", res.data.data.user);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },

  logout({ commit }): void {
    commit("LOGOUT");
  },
};
