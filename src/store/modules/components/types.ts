export interface ComponentState {
  components: object[] | null;
  selectedComponent: object | null;
  componentItems: object[] | null;
  myComponentItems: object[] | null;
  sidebarDraggedComponentItemIndex: number | null;
  draggedComponentItemIndex: number | null;
  dragSource: string | null;
  draggedComponentItemHeight: number | null;
  draggedComponentItemOffsetY: number | null;
  draggedComponentItemCurrentY: number | null;
}
