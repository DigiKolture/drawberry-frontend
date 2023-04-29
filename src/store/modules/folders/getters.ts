import { GetterTree } from "vuex";
import { FolderState } from "@/store/modules/folders/types";
import { RootState } from "@/store/types";

export const getters: GetterTree<FolderState, RootState> = {
  folders(state: FolderState): object[] | null {
    return state.folders;
  },
  folder(state: FolderState): object | null {
    return state.folder;
  },
};
