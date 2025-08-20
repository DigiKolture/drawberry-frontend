import { canvas } from "@/composables/canvas/canvas";
const { canvasLoaded } = canvas();
import { computed, onMounted } from "vue";
import store from "@/store";
import { arrange } from "@/composables/canvas/elements/arrange";
const { arrangeElementsInComponentHTML } = arrange();

export function elementsDragAndDrop() {
  onMounted(() => {
    store.commit("element/RESET_ELEMENT_DRAG_AND_DROP");
  });

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
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

  const reorderElements = (
    fromIndex: number,
    toIndex: number,
    componentItem: any
  ) => {
    const jsonData = componentItem.json;
    const realFromIndex = getRealParentIndex(jsonData, fromIndex);
    const realToIndex = getRealParentIndex(jsonData, toIndex);

    const elementItem = jsonData[realFromIndex];

    // Cannot reorder elements across different wrappers
    if (elementItem.wrapperId !== jsonData[realToIndex].wrapperId) {
      return;
    }

    // Remove from original position and insert at new position
    componentItem.json.splice(realFromIndex, 1);
    componentItem.json.splice(realToIndex, 0, elementItem);

    // Update HTML to reflect new order
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.html,
      componentItem.json
    );
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

        reorderElements(fromIndex, toIndex, componentItem);

        store.commit(
          "element/SET_LAST_DRAG_FROM_ELEMENT_ID",
          draggedElement.id
        );
        store.commit("element/SET_LAST_DRAG_TO_ELEMENT_ID", editable.id);
      });

      editable.addEventListener("drop", (e: any) => {
        e.preventDefault();
        e.stopPropagation();

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

  return {
    enableInnerDrag,
  };
}
