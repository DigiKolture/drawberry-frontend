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
import * as cheerio from "cheerio";

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
  const fromItemElementId = computed(
    () => store.getters["element/fromItemElementId"]
  );
  const fromItemElementIndex = computed(
    () => store.getters["element/fromItemElementIndex"]
  );
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

  const getAllParentIdsWithBlock = (html: string, id: string) => {
    const $ = cheerio.load(html);
    const el = $(`#${id}`);

    // Check if element exists
    if (el.length === 0) {
      return [];
    }

    const parentIds = [];

    // Check if the main element itself has no parent attribute
    if (!el.attr("parent")) {
      parentIds.push(id);
    }

    // Find all descendants with an id but no parent attribute (at all depths)
    el.find("[id]:not([parent])").each((i, element) => {
      const elementId = $(element).attr("id");
      if (elementId) {
        parentIds.push(elementId);
      }
    });

    return parentIds;
  };

  const getIndicesFromIds = (jsonData: any[], ids: string[]) => {
    const indices: number[] = [];

    ids.forEach((id: string) => {
      const index = jsonData.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        indices.push(index);
      }
    });

    return indices;
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
    const realToIndex = getRealParentIndex(jsonData, toIndex);

    if (realFromIndex === realToIndex) {
      return false;
    }

    const fromBlockIds = getAllParentIdsWithBlock(
      componentItem.html,
      jsonData[realFromIndex].id
    );
    const toBlockIds = getAllParentIdsWithBlock(
      componentItem.html,
      jsonData[realToIndex].id
    );

    // console.log({ fromBlockIds, toBlockIds });
    //
    // console.log("Before Reorder:");
    // console.log(componentItem.json);

    // Remove from original position and insert at new position
    // componentItem.json.splice(realFromIndex, 1);
    // componentItem.json.splice(realToIndex, 0, elementItem);

    // Get all indices for fromBlockIds and toBlockIds
    const fromIndices = getIndicesFromIds(jsonData, fromBlockIds);
    const toIndices = getIndicesFromIds(jsonData, toBlockIds);

    // console.log({ fromIndices, toIndices });

    // Sort indices to maintain order
    fromIndices.sort((a, b) => a - b);
    toIndices.sort((a, b) => a - b);

    // console.log({ fromIndices, toIndices });

    // Determine direction: forward (moving down) or backward (moving up)
    const minFromIndex = Math.min(...fromIndices);
    const maxToIndex = Math.max(...toIndices);
    const isMovingBackward = minFromIndex > maxToIndex;

    // console.log({ isMovingBackward, minFromIndex, maxToIndex });

    // Extract elements to move
    const elementsToMove = fromIndices.map((index: number) => jsonData[index]);

    // Remove elements from original positions (remove from highest index first to avoid index shifting)
    [...fromIndices]
      .sort((a, b) => b - a)
      .forEach((index: number) => {
        componentItem.json.splice(index, 1);
      });

    let adjustedToIndex;

    if (isMovingBackward) {
      // Moving backward: insert BEFORE the first element in toIndices
      const firstToIndex = Math.min(...toIndices);
      // Adjust for removed elements that were before the insertion point
      adjustedToIndex =
        firstToIndex -
        fromIndices.filter((i: number) => i < firstToIndex).length;
    } else {
      // Moving forward: insert AFTER the last element in toIndices
      const lastToIndex = Math.max(...toIndices);
      // Adjust for removed elements that were before or at the insertion point
      adjustedToIndex =
        lastToIndex +
        1 -
        fromIndices.filter((i: number) => i <= lastToIndex).length;
    }

    // console.log({ adjustedToIndex });

    // Insert all elements at new position
    componentItem.json.splice(adjustedToIndex, 0, ...elementsToMove);

    // console.log("After Reorder:");
    // console.log(componentItem.json);

    // Update HTML to reflect new order
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.html,
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
      store.commit("element/SET_FROM_ITEM_ELEMENT_INDEX", startIndex);
      // e.dataTransfer.setData("fromItemElementIndex", startIndex);
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
          e.preventDefault();
          return false;
        }

        store.commit("element/SET_IS_DRAGGING", true);
        store.commit("element/SET_LAST_DRAG_FROM_ELEMENT_ID", null);
        store.commit("element/SET_LAST_DRAG_TO_ELEMENT_ID", null);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";

        store.commit("element/SET_FROM_ITEM_ELEMENT_ID", editable.id);
        // e.dataTransfer.setData("fromItemElementId", editable.id);

        setElementDragData(e, editable.id);
        e.stopPropagation();
      });

      editable.addEventListener("dragover", (e: any) => {
        e.preventDefault();
        if (!isDragging.value) {
          return;
        }

        const fromIndexDrag = editables.findIndex(
          (el: any) => el.id === fromItemElementId.value
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
            fromItemElementIndex.value
          );
          const realToIndex = getRealParentIndex(
            projectComponentItem.json,
            toIndex
          );

          const jsonElement = find(
            projectComponentItem.json,
            "id",
            fromItemElementId.value //Using this because lastFromId changes when drag occurs
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
      componentItem.html,
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
