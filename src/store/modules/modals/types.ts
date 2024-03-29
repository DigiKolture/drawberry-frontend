export interface ModalState {
  export: boolean;
  preview: boolean;
  manage_esp: boolean;
  share_preview: boolean;
  color_picker: string;
  project_create: boolean;
  project_update: boolean;
  project_duplicate: boolean;
  project_delete: boolean;
  project_item: number;
  folder_item: number;
  folder_create: boolean;
  folder_update: boolean;
  folder_duplicate: boolean;
  folder_delete: boolean;
  [key: string]: boolean | string | number;
}

export const centerModals = [
  "project_duplicate",
  "project_delete",
  "folder_create",
  "folder_update",
  "folder_duplicate",
];

export enum ColorPickerTypes {
  GENERAL_STYLE_BG_COLOR = "general_style_bg_color",
  GENERAL_BTN_COLOR = "general_btn_color",
  PANEL_STYLE_BG_COLOR = "panel_style_bg_color",
  PANEL_STYLE_TEXT_COLOR = "panel_style_text_color",
  PANEL_BOX_SHADOW_COLOR = "panel_box_shadow_color",
}

export const GENERAL_STYLE_TYPE_COLORS = [
  ColorPickerTypes.GENERAL_STYLE_BG_COLOR,
  ColorPickerTypes.GENERAL_BTN_COLOR,
];

export const PANEL_STYLE_TYPE_COLORS = [
  ColorPickerTypes.PANEL_STYLE_BG_COLOR,
  ColorPickerTypes.PANEL_STYLE_TEXT_COLOR,
  ColorPickerTypes.PANEL_BOX_SHADOW_COLOR,
];
