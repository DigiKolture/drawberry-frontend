export interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
}

export enum HistoryActionTypes {
  COMPONENT_STYLE = "component_style",
  COMPONENT_ATTRIBUTE = "component_attribute",
  COMPONENT_CONTENT = "component_content",
  PROJECT_STYLE = "project_style",
  PROJECT_COMPONENT_ADD = "project_component_add",
  PROJECT_COMPONENT_DUPLICATE = "project_component_duplicate",
  PROJECT_COMPONENT_DELETE = "project_component_delete",
  PROJECT_COMPONENT_MODIFY_POSITION = "project_component_modify_position",
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
  workspaceComponentItemId: string;
}

export interface ProjectGeneralStyleHistoryAction extends BaseHistoryAction {
  type: HistoryActionTypes.PROJECT_STYLE;
}

export interface ProjectComponentAddDeleteHistoryAction {
  type:
    | HistoryActionTypes.PROJECT_COMPONENT_ADD
    | HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE
    | HistoryActionTypes.PROJECT_COMPONENT_DELETE;
  workspaceComponentItemId: string;
  projectComponent: any;
  positionIndex: number;
}

export interface ProjectComponentModifyPositionHistoryAction {
  type: HistoryActionTypes.PROJECT_COMPONENT_MODIFY_POSITION;
  workspaceComponentItemId: string;
  positionIndex: number;
  toIndex: number;
}

export type HistoryAction =
  | ProjectComponentHistoryAction
  | ProjectGeneralStyleHistoryAction
  | ProjectComponentAddDeleteHistoryAction
  | ProjectComponentModifyPositionHistoryAction;
