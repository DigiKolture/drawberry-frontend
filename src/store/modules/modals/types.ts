export interface ModalState {
  export: boolean;
  preview: boolean;
  manage_esp: boolean;
  share_preview: boolean;
  color_picker: string;
  [key: string]: boolean | string;
}

export enum ColorPickerTypes {
  GENERAL_STYLE_BG_COLOR = "general_style_bg_color",
  PANEL_STYLE_BG_COLOR = "panel_style_bg_color",
  PANEL_STYLE_TEXT_COLOR = "panel_style_text_color",
}
