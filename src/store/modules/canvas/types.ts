export interface CurrentHoverElementType {
  id: string | null;
  componentIndex: number | null;
}

export interface ProjectStyle {
  layout: string;
  backgroundColor: string;
  fontFamily: string;
  buttonColor: string;
  backgroundImage: string;
  previewText: string;
}

export interface CanvasState {
  focusedElement: object | null;
  focusedIndex: number | null;
  currentHoverElement: CurrentHoverElementType;
  sidebarNavContent: string | null;
  currentPreview: string | null;
  sidebarDock: boolean;
  showPreview: boolean;
  workspaceComponents: any[];
  googleFonts: any[];
  fontWeights: number[];
  style: ProjectStyle;
}
