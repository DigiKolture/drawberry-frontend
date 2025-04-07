import { HistoryActionTypes } from "@/store/modules/history/types";

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
  navigatedFromPreview: boolean;
  llmPrompt: string;
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
  loadState: CanvasLoadingState;
  updatedComponents: UpdatedComponent[];
  scrollIntervalsIds: number[];
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

export const ActionToEditableTypeMap = {
  [HistoryActionTypes.COMPONENT_STYLE]: CanvasEditableTypes.STYLE,
  [HistoryActionTypes.COMPONENT_ATTRIBUTE]: CanvasEditableTypes.ATTRIBUTE,
  [HistoryActionTypes.COMPONENT_CONTENT]: CanvasEditableTypes.CONTENT,
};

export enum CanvasSaveStatus {
  SAVED = "saved",
  UPDATED = "updated",
  OFFLINE = "offline",
  PAUSED = "paused",
}

export enum CanvasLoadingState {
  UNINITIALIZED = "uninitialized",
  IN_PROGRESS = "in_progress",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum CanvasSaveStatusDescriptions {
  SAVED = "Changes saved",
  UPDATED = "Saving changes",
  OFFLINE = "offline",
  PAUSED = "Saving paused",
}
