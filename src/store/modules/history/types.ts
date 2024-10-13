export interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
}

export enum HistoryActionTypes {
  COMPONENT_STYLE = "component_style",
  COMPONENT_ATTRIBUTE = "component_attribute",
  COMPONENT_CONTENT = "component_content",
  PROJECT_STYLE = "project_style",
}

export interface BaseHistoryAction {
  type: HistoryActionTypes;
  modifier: string;
  value: string | number;
  previousValue: string;
}

export interface ProjectComponentHistoryAction extends BaseHistoryAction {
  type:
    | HistoryActionTypes.COMPONENT_STYLE
    | HistoryActionTypes.COMPONENT_ATTRIBUTE
    | HistoryActionTypes.COMPONENT_CONTENT;
  elementId: string;
  componentIndex: number;
}

export interface ProjectGeneralStyleHistoryAction extends BaseHistoryAction {
  type: HistoryActionTypes.PROJECT_STYLE;
  elementId?: string;
  componentIndex?: number;
}

export type HistoryAction =
  | ProjectComponentHistoryAction
  | ProjectGeneralStyleHistoryAction;
