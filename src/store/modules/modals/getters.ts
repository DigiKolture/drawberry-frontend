import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { centerModals, ModalState } from "@/store/modules/modals/types";

export const getters: GetterTree<ModalState, RootState> = {
  manageESP(state: ModalState): boolean {
    return state.manage_esp;
  },
  sharePreview(state: ModalState): boolean {
    return state.share_preview;
  },
  preview(state: ModalState): boolean {
    return state.preview;
  },
  export(state: ModalState): boolean {
    return state.export;
  },
  colorPicker(state: ModalState): string {
    return state.color_picker;
  },
  projectCreate(state: ModalState): boolean {
    return state.project_create;
  },
  projectDuplicate(state: ModalState): boolean {
    return state.project_duplicate;
  },
  projectDelete(state: ModalState): boolean {
    return state.project_delete;
  },
  projectItem(state: ModalState): number {
    return state.project_item;
  },
  folderItem(state: ModalState): number {
    return state.folder_item;
  },
  folderDuplicate(state: ModalState): boolean {
    return state.folder_duplicate;
  },
  isCenterModals(state: ModalState): boolean {
    return centerModals.some((key: string) => state[key] === true);
  },
  modal:
    (state: ModalState) =>
    (type: string): boolean | string | number => {
      // Use the parameter in your logic
      return state[type];
    },
};
