import { Module } from "vuex";
import { AuthState } from "@/store/modules/auth/types";
import { RootState } from "@/store/types";
import { getters } from "@/store/modules/auth/getters";
import { mutations } from "@/store/modules/auth/mutations";
import { actions } from "@/store/modules/auth/actions";

const state: AuthState = {
  user: null,
  jwt: null,
};

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default auth;
