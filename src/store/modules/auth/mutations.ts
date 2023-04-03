import { MutationTree } from "vuex";
import { AuthState } from "@/store/modules/auth/types";

export const mutations: MutationTree<AuthState> = {
  SET_AUTH_USER(state: AuthState, user: object | null) {
    if (user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      state.user = null;
      localStorage.removeItem("user");
    }
    return state.user;
  },
  SET_JWT(state: AuthState, data: string) {
    state.jwt = data;
    localStorage.setItem("access-token", data);
    return state.jwt;
  },
  LOGOUT(state: AuthState) {
    state.user = null;
    state.jwt = null;
    localStorage.removeItem("user");
    localStorage.removeItem("access-token");
    return state;
  },
};
