export interface ElementState {
  isDragging: boolean;
  fromItemElementId: string | null;
  fromItemElementIndex: number | null;
  lastDragFromElementId: string | null;
  lastDragToElementId: string | null;
}
