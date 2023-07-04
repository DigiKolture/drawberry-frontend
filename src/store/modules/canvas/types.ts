export interface CurrentHoverElementType {
  id: string | null;
  componentIndex: number | null;
}

export interface ProjectStyle {
  layout: string;
  backgroundColor: string;
  font: string;
  buttonColor: string;
  backgroundImage: string;
  previewText: string;
}

export interface CanvasState {
  focusedElement: object | null;
  focusedIndex: number | null;
  currentHoverElement: CurrentHoverElementType;
  sidebarNavContent: string | null;
  sidebarDock: boolean;
  workspaceComponents: any[];
  style: ProjectStyle;
}
