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

export interface UpdatedComponent {
  projectComponentItemId: string;
  json: any[];
}

export interface CanvasState {
  focusedElement: object | null;
  focusedParentElement: object | null;
  focusedChildrenElements: any[];
  focusedIndex: number | null;
  currentHoverElement: CurrentHoverElementType;
  sidebarNavContent: string | null;
  sidebarDock: boolean;
  workspaceComponents: any[];
  hasWorkspaceComponent: boolean;
  saveStatus: CanvasSaveStatus;
  updatedComponents: UpdatedComponent[];
  googleFonts: any[];
  fontWeights: number[];
  generalStyle: ProjectStyle;
  style: ProjectStyle;
  dropLoading: boolean;
  savedColors: string[];
}

export enum CanvasEditableTypes {
  STYLE = "style",
  ATTRIBUTE = "attribute",
  CONTENT = "content",
}

export enum CanvasSaveStatus {
  SAVED = "saved",
  UPDATED = "updated",
  OFFLINE = "offline",
  PAUSED = "paused",
}

export enum CanvasSaveStatusDescriptions {
  SAVED = "Changes saved",
  UPDATED = "Saving changes",
  OFFLINE = "offline",
  PAUSED = "Saving paused",
}
