export interface CurrentHoverElementType {
  id: string | null;
  componentIndex: number | null;
}

export interface CanvasState {
  focusedElement: object | null;
  focusedIndex: number | null;
  currentHoverElement: CurrentHoverElementType;
  sidebarNavContent: string | null;
  sidebarDock: boolean;
  workspaceComponents: any[];
}
