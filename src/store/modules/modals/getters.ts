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
  emailPreview(state: ModalState): boolean {
    return state.email_preview;
  },
  preview(state: ModalState): boolean {
    return state.preview;
  },
  export(state: ModalState): boolean {
    return state.export;
  },
  userInitials(state: ModalState): boolean {
    return state.user_initials;
  },
  colorPicker(state: ModalState): string {
    return state.color_picker;
  },
  projectCreate(state: ModalState): boolean {
    return state.project_create;
  },
  projectUpdate(state: ModalState): boolean {
    return state.project_update;
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
  folderCreate(state: ModalState): boolean {
    return state.folder_create;
  },
  folderUpdate(state: ModalState): boolean {
    return state.folder_update;
  },
  folderDuplicate(state: ModalState): boolean {
    return state.folder_duplicate;
  },
  folderDelete(state: ModalState): boolean {
    return state.folder_delete;
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
