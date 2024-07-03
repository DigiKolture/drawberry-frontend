import { ActionTree } from "vuex";
import { AuthState } from "@/store/modules/auth/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";
import { helpers } from "@/composables/helpers";

const baseUrl = "/auth";

const { rejectError } = helpers();

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
      .catch((err) => {
        return rejectError(err);
      });
  },

  forgotPassword({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}/forgot-password`, data)
      .then((res: any) => {
        return res.data;
      })
      .catch((err) => {
        return rejectError(err);
      });
  },

  resetPassword({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}/reset-password`, data)
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
      .catch((err) => {
        return rejectError(err);
      });
  },

  oAuthLogin({ commit }, data): Promise<void> {
    return AxiosClient.post(`${baseUrl}/google/login`, data)
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
      .catch((err) => {
        return rejectError(err);
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
      .catch((err) => {
        return rejectError(err);
      });
  },

  getUser({ commit }): void | Promise<void> {
    return AxiosClient.get(`${baseUrl}/user`)
      .then((res: any) => {
        commit("SET_AUTH_USER", res.data.data.user);
        return res.data;
      })
      .catch((err) => {
        return rejectError(err);
      });
  },

  logout({ commit }): void {
    commit("LOGOUT");
  },
};
