import { CanvasBreakpoints } from "@/store/modules/canvas/types";

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
  PROJECT_COMPONENT_ELEMENT_DUPLICATE = "project_component_element_duplicate",
  PROJECT_COMPONENT_ELEMENT_MODIFY_POSITION = "project_component_element_modify_position",
  BATCH = "batch",
}

export interface BaseHistoryAction {
  id?: string;
  type: HistoryActionTypes;
  modifier: string;
  breakpoint?: CanvasBreakpoints;
  value: string | number;
  previousValue: string;
  timestamp?: number; //in milliseconds
}

export enum HistoryComponentUpdateTypes {
  COMPONENT_STYLE = "component_style",
  COMPONENT_ATTRIBUTE = "component_attribute",
  COMPONENT_CONTENT = "component_content",
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
  id?: string;
  type:
    | HistoryActionTypes.PROJECT_COMPONENT_ADD
    | HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE
    | HistoryActionTypes.PROJECT_COMPONENT_DELETE;
  workspaceComponentItemId: string;
  projectComponent: any;
  positionIndex: number;
  modifier?: string;
  timestamp?: number;
}

export interface ProjectComponentModifyPositionHistoryAction {
  id?: string;
  type: HistoryActionTypes.PROJECT_COMPONENT_MODIFY_POSITION;
  workspaceComponentItemId: string;
  positionIndex: number;
  toIndex: number;
  modifier?: string;
  timestamp?: number;
}

export interface ProjectComponentElementDuplicateHistoryAction {
  id?: string;
  type: HistoryActionTypes.PROJECT_COMPONENT_ELEMENT_DUPLICATE;
  workspaceComponentItemId: string;
  projectComponent: any;
  elementId: string;
  duplicatedElementId: string;
  modifier?: string;
  timestamp?: number;
}

export interface ProjectComponentElementModifyHistoryAction {
  id?: string;
  type: HistoryActionTypes.PROJECT_COMPONENT_ELEMENT_MODIFY_POSITION;
  workspaceComponentItemId: string;
  elementId: string;
  positionIndex: number;
  toIndex: number;
  modifier?: string;
  timestamp?: number;
}

export interface BatchHistoryAction {
  id?: string;
  type: HistoryActionTypes.BATCH;
  actions: HistoryAction[];
  timestamp?: number;
}

export type HistoryAction =
  | ProjectComponentHistoryAction
  | ProjectGeneralStyleHistoryAction
  | ProjectComponentAddDeleteHistoryAction
  | ProjectComponentModifyPositionHistoryAction
  | ProjectComponentElementDuplicateHistoryAction
  | ProjectComponentElementModifyHistoryAction
  | BatchHistoryAction;
