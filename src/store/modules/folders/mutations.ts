import { MutationTree } from "vuex";
import { FolderState } from "@/store/modules/folders/types";

export const mutations: MutationTree<FolderState> = {
  SET_FOLDERS(state: FolderState, data: object[]) {
    state.folders = data;
    return state.folders;
  },
  SET_FOLDER(state: FolderState, data: object) {
    state.folder = data;
    return state.folder;
  },
};
