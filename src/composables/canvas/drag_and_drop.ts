import store from "@/store";
import { computed, ref } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
import { modifiersProjectActions } from "@/composables/canvas/modifiers/modifiers-project-actions";
const { updateHistory } = history();

export function drag_and_drop() {
  const intervalId = ref<number | null>(null);
  const { addProjectComponent } = modifiersProjectActions();

  const { removeCurrentFocus, removeFocus, removeAllFocus } = focus();
  const SCROLL_INTERVAL = 50; // ms between scroll events
  const BOTTOM_THRESHOLD = 200;
  const TOP_THRESHOLD = 250; //Added 50 because of the header
  const BOTTOM_EDGE_THRESHOLD = 80; // Distance from very edge to trigger extreme scroll
  const TOP_EDGE_THRESHOLD = 140; // Distance from very edge to trigger extreme scroll
  const NORMAL_SCROLL_SPEED = 40;
  const EXTREME_SCROLL_SPEED = 100; // Faster scroll speed when near the very edge

  const dropPosition = ref(""); // 'top' or 'bottom'

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const componentItems = computed(() => {
    return store.getters["components/componentItems"];
  });

  const scrollIntervalsIds = computed(() => {
    return store.getters["canvas/scrollIntervalsIds"];
  });

  const checkIfParentIsBeenDragged = (e: any) => {
    const isDraggableElement =
      e.target.classList.contains("component__items__list__item") ||
      e.target.classList.contains("workspace__component__items__list__item");

    if (!isDraggableElement) {
      e.preventDefault();
      return false;
    }

    return true;
  };

  const dragComponentItemToCanvas = (e: any, itemIndex: any) => {
    const isParent = checkIfParentIsBeenDragged(e);
    if (!isParent) return;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    store.commit("components/SET_SIDEBAR_COMPONENT_DATA", {
      index: itemIndex,
      source: "from-sidebar",
    });
  };

  const moveComponentItem = async (
    e: any,
    toIndex: number,
    projectId: string
  ) => {
    const sidebarDraggedComponentItemIndex =
      store.getters["components/sidebarDraggedComponentItemIndex"];
    if (sidebarDraggedComponentItemIndex == null) return;

    const componentItem =
      componentItems.value[sidebarDraggedComponentItemIndex];
    if (!componentItem || !projectId) return;

    // workspaceComponents.value.push(componentItem);
    // store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    addProjectComponent(componentItem, toIndex);
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    const isParent = checkIfParentIsBeenDragged(e);
    if (!isParent) return;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    store.commit("components/SET_DRAG_DATA", {
      index: itemIndex,
      source: "from-workspace",
      //Used for scrolling when component is being dragged
      height: e.target.offsetHeight,
      offsetY: e.offsetY,
      currentY: e.clientY,
    });
  };

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const upsertComponentItem = async (
    e: any,
    toIndex: number,
    projectId: string
  ) => {
    const type = store.getters["components/dragSource"];

    if (type === "from-sidebar") {
      ui.changeComponentItemsStatus(false);
      removeCurrentFocus();
      removeFocus();
      await moveComponentItem(e, toIndex, projectId);
      // focusComponentElement(toIndex, 0);
    } else {
      const fromComponentItemIndex =
        store.getters["components/draggedComponentItemIndex"];

      if (fromComponentItemIndex === null || !projectId) return;

      changeComponentItemPosition(fromComponentItemIndex, toIndex);
    }
  };

  const changeComponentItemPosition = async (
    fromIndex: number,
    toIndex: number,
    dragAndDrop = true
  ) => {
    if (fromIndex === toIndex) return;

    if (dragAndDrop) {
      if (toIndex > 0 && toIndex > fromIndex) toIndex = toIndex - 1;
    }

    // Remove focus from the current component if it's not the one being changed
    if (focusedIndex.value === fromIndex) {
      store.commit("canvas/SET_FOCUSED_INDEX", toIndex);
    } else {
      removeAllFocus();
    }
    const projectComponentItem = workspaceComponents.value[fromIndex];

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_MODIFY_POSITION,
      positionIndex: fromIndex,
      workspaceComponentItemId: projectComponentItem.id,
      toIndex,
    });

    workspaceComponents.value.splice(fromIndex, 1);
    workspaceComponents.value.splice(toIndex, 0, projectComponentItem);

    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    // TODO: Might remove this, cos API runs every 5 seconds (Removed temp)
    // store.dispatch("canvas/updateProjectComponentsAndStyles").then();
  };

  const handleScroll = (event: any) => {
    const fromComponentItemIndex =
      store.getters["components/draggedComponentItemIndex"];
    const dragElementHeight =
      store.getters["components/draggedComponentItemHeight"];
    const dragOffsetY = store.getters["components/draggedComponentItemOffsetY"];
    const dragCurrentY =
      store.getters["components/draggedComponentItemCurrentY"];

    if (!fromComponentItemIndex) return;

    const currentY = event.clientY;
    const height = window.innerHeight;

    const distanceFromTop = currentY;
    const distanceFromBottom = height - distanceFromTop;
    const realDistanceFromTop = distanceFromTop - parseInt(dragOffsetY); // Subtract the offset
    const realDistanceFromBottom =
      distanceFromBottom -
      (parseInt(dragElementHeight) - parseInt(dragOffsetY)); // Subtract the offset

    if (
      distanceFromTop < parseInt(dragCurrentY) // If the item is being dragged up
    ) {
      if (realDistanceFromTop < TOP_EDGE_THRESHOLD) {
        window.scrollBy(0, -EXTREME_SCROLL_SPEED);
      } else if (realDistanceFromTop < TOP_THRESHOLD) {
        window.scrollBy(0, -NORMAL_SCROLL_SPEED);
      }
    } else if (distanceFromTop > parseInt(dragCurrentY)) {
      if (realDistanceFromBottom < BOTTOM_EDGE_THRESHOLD) {
        window.scrollBy(0, EXTREME_SCROLL_SPEED);
      } else if (realDistanceFromBottom < BOTTOM_THRESHOLD) {
        window.scrollBy(0, NORMAL_SCROLL_SPEED);
      }
    }
    // console.log({
    //   dragCurrentY,
    //   distanceFromTop,
    //   realDistanceFromTop,
    //   distanceFromBottom,
    //   realDistanceFromBottom,
    //   draggedIndex,
    //   dragElementHeight,
    //   offsetY,
    //   dragOffsetY,
    // });
  };

  const stopScrolling = () => {
    for (const scrollIntervalsId of scrollIntervalsIds.value) {
      window.clearInterval(scrollIntervalsId);
    }
    intervalId.value = null;
  };

  return {
    dragComponentItemToCanvas,
    moveComponentItem,
    checkIfParentIsBeenDragged,
    upsertComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
    handleScroll,
    stopScrolling,
  };
}
