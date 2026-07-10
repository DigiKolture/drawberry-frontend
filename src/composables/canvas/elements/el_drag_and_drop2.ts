import { canvas } from "@/composables/canvas/canvas";
const { canvasLoaded } = canvas();
import { computed, onMounted } from "vue";
import store from "@/store";
import { arrange } from "@/composables/canvas/elements/arrange";
import { helpers } from "@/composables/helpers";
import {
  HistoryActionTypes,
  ProjectComponentElementModifyHistoryAction,
} from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
const { arrangeElementsInComponentHTML } = arrange();
const { findIndex, find } = helpers();
const { updateHistory } = history();

export function elementsDragAndDrop() {
  onMounted(() => {
    store.commit("element/RESET_ELEMENT_DRAG_AND_DROP");
  });

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });
  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });
  const isDragging = computed(() => store.getters["element/isDragging"]);
  const lastFromId = computed(
    () => store.getters["element/lastDragFromElementId"]
  );
  const lastToId = computed(() => store.getters["element/lastDragToElementId"]);

  const canDropElement = (fromIndex: number, toIndex: number) => {
    // if (parsedFromIndex == null) {
    //   console.log("<<<<<<<<<< Meeeting theis condition 1111 >>>>>>>>>>>");
    //   return false;
    // }
    // if (fromIndex == toIndex) {
    //   return false;
    // }
    return true;
  };

  const getRealParentIndex = (json: any[], index: number): number => {
    const element = json[index];
    if (element.parent == null) return index;
    return json.findIndex((el: any) => el.id === element.parent);
  };

  const getBlockId = (elementId: number, json: any[]): null | string => {
    const element = find(json, "id", elementId);
    if (element == null) return null;
    return element.blockId ? element.blockId : element.id;
  };

  const reorderElements = (
    fromIndex: number,
    toIndex: number,
    componentItem: any
  ) => {
    const jsonData = componentItem.json;

    /**
     * Cannot reorder elements across different wrappers
     * I am using this index instead of the parent index because only the block indexes are guaranteed to have a wrapperId
     *  wrapperId can be null for parent element
     */
    if (jsonData[fromIndex].wrapperId !== jsonData[toIndex].wrapperId) {
      return false;
    }

    const realFromIndex = getRealParentIndex(jsonData, fromIndex);
    const elementItem = jsonData[realFromIndex];

    const realToIndex = getRealParentIndex(jsonData, toIndex);

    // Remove from original position and insert at new position
    componentItem.json.splice(realFromIndex, 1);
    componentItem.json.splice(realToIndex, 0, elementItem);

    // Update HTML to reflect new order
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.defaultHtml,
      componentItem.json
    );

    return true;
  };

  const setElementDragData = (e: any, elementId: string) => {
    const projectComponentItem = workspaceComponents.value[focusedIndex.value];
    let startIndex = findIndex(projectComponentItem.json, "id", elementId);
    if (startIndex !== null) {
      startIndex = getRealParentIndex(projectComponentItem.json, startIndex);
    }

    if (startIndex !== null) {
      e.dataTransfer.setData("fromItemElementIndex", startIndex);
    }
  };

  const enableInnerDrag = (itemIndex: number) => {
    if (!canvasLoaded.value) {
      return;
    }

    const elementId = `workspace-component-item-${itemIndex}`;
    const el = document.getElementById(elementId);
    if (!el) return;

    //Select all editable elements (that are parent) within the component item
    const editables = Array.from(el.querySelectorAll("[block]"));

    editables.forEach((editable: any, index: number) => {
      editable.setAttribute("draggable", true);

      editable.addEventListener("dragstart", (e: any) => {
        // Check if this element has focus OR any of its children have focus
        const hasFocus =
          editable.classList.contains("focus") ||
          editable.querySelector(".focus") !== null;

        if (!hasFocus) {
          return;
        }

        store.commit("element/SET_IS_DRAGGING", true);
        store.commit("element/SET_LAST_DRAG_FROM_ELEMENT_ID", null);
        store.commit("element/SET_LAST_DRAG_TO_ELEMENT_ID", null);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";

        e.dataTransfer.setData("fromItemElementId", editable.id);

        console.log({
          edibleId: editable.id,
          fromItemElementId: e.dataTransfer.getData("fromItemElementId"),
        });

        setElementDragData(e, editable.id);
        e.stopPropagation();
      });

      editable.addEventListener("dragover", (e: any) => {
        e.preventDefault();
        if (!isDragging.value) {
          return;
        }

        const fromIndexDrag = editables.findIndex(
          (el: any) => el.id === e.dataTransfer.getData("fromItemElementId")
        );

        if (!canDropElement(fromIndexDrag, index)) {
          return;
        }
        const draggedElement = editables[fromIndexDrag];
        if (!draggedElement) return;
        const draggedEl = document.getElementById(draggedElement.id);

        if (
          draggedElement.id === lastFromId.value &&
          editable.id === lastToId.value
        ) {
          return;
        }

        const componentItem = workspaceComponents.value[itemIndex];
        const fromIndex = componentItem.json.findIndex(
          (el: any) => el.id === draggedEl?.id
        );
        const toIndex = componentItem.json.findIndex(
          (el: any) => el.id === editable.id
        );

        const reorder = reorderElements(fromIndex, toIndex, componentItem);
        if (!reorder) return;

        store.commit(
          "element/SET_LAST_DRAG_FROM_ELEMENT_ID",
          draggedElement.id
        );
        store.commit("element/SET_LAST_DRAG_TO_ELEMENT_ID", editable.id);
      });

      editable.addEventListener("drop", (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        const projectComponentItem = workspaceComponents.value[itemIndex];

        const toIndex = findIndex(
          projectComponentItem.json,
          "id",
          lastToId.value
        );

        if (toIndex !== null) {
          const realFromIndex = getRealParentIndex(
            projectComponentItem.json,
            parseInt(e.dataTransfer.getData("fromItemElementIndex"))
          );
          const realToIndex = getRealParentIndex(
            projectComponentItem.json,
            toIndex
          );

          const jsonElement = find(
            projectComponentItem.json,
            "id",
            e.dataTransfer.getData("fromItemElementId") //Using this because lastFromId changes when drag occurs
          );

          if (realFromIndex !== realToIndex) {
            updateHistory({
              type: HistoryActionTypes.PROJECT_COMPONENT_ELEMENT_MODIFY_POSITION,
              workspaceComponentItemId: projectComponentItem.id,
              elementId:
                jsonElement.parent === null
                  ? jsonElement.id
                  : jsonElement.parent,
              positionIndex: realFromIndex,
              toIndex: realToIndex,
            });
          }
        }

        if (!isDragging.value) {
          return;
        }
        store.commit("element/RESET_ELEMENT_DRAG_AND_DROP");
      });

      editable.addEventListener("dragend", () => {
        store.commit("element/RESET_ELEMENT_DRAG_AND_DROP");
      });
    });
  };

  const updateProjectComponentElementModifyPosition = (
    action: ProjectComponentElementModifyHistoryAction,
    undo: boolean
  ) => {
    const { workspaceComponentItemId, elementId, positionIndex, toIndex } =
      action;

    // Find the component in workspace
    const componentIndex = findIndex(
      workspaceComponents.value,
      "id",
      workspaceComponentItemId
    );
    if (componentIndex === null) return null;

    const componentItem = workspaceComponents.value[componentIndex];

    // Find the element in the component's JSON
    const elementIndex = componentItem.json.findIndex(
      (item: any) => item.id === elementId
    );
    if (elementIndex === -1) return null;

    const element = componentItem.json[elementIndex];

    if (undo) {
      // Move element back from toIndex to original positionIndex
      componentItem.json.splice(toIndex, 1);
      componentItem.json.splice(positionIndex, 0, element);
    } else {
      // Redo: Move element from positionIndex to toIndex
      componentItem.json.splice(positionIndex, 1);
      componentItem.json.splice(toIndex, 0, element);
    }

    // Update the component HTML after modifying the JSON
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.defaultHtml,
      componentItem.json
    );

    // Update the store
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
    return workspaceComponents.value;
  };

  return {
    getBlockId,
    getRealParentIndex,
    enableInnerDrag,
    setElementDragData,
    updateProjectComponentElementModifyPosition,
  };
}
