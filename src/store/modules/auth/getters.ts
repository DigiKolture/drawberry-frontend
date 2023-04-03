import { GetterTree } from "vuex";
import { AuthState } from "@/store/modules/auth/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<AuthState, RootState> = {
  authUser(state: AuthState): object | null {
    return state.user;
  },
  jwt(state: AuthState): string | null {
    return state.jwt;
  },
};
