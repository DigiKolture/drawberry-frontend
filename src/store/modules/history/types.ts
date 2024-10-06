export interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
}

export enum HistoryActionTypes {
  COMPONENT_STYLE = "component_style",
  COMPONENT_ATTRIBUTE = "component_attribute",
  PROJECT_STYLE = "project_style",
}

export interface HistoryAction {
  elementId: string;
  type: HistoryActionTypes;
  componentIndex: number;
  modifier: string;
  value: string | number;
  previousValue: string;
}
