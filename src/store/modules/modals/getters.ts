import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { ModalState } from "@/store/modules/modals/types";

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
  modal:
    (state: ModalState) =>
    (type: string): boolean | string => {
      // Use the parameter in your logic
      return state[type];
    },
};
