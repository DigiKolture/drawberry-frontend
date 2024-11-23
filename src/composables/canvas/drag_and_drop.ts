import store from "@/store";
import { computed, ref } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
const { updateHistory } = history();

export function drag_and_drop() {
  const intervalId = ref<number | null>(null);

  const { removeCurrentFocus, removeFocus, removeAllFocus } = focus();
  const SCROLL_INTERVAL = 50; // ms between scroll events
  const BOTTOM_THRESHOLD = 200;
  const TOP_THRESHOLD = 250; //Added 50 because of the header
  const BOTTOM_EDGE_THRESHOLD = 80; // Distance from very edge to trigger extreme scroll
  const TOP_EDGE_THRESHOLD = 140; // Distance from very edge to trigger extreme scroll
  const NORMAL_SCROLL_SPEED = 20;
  const EXTREME_SCROLL_SPEED = 100; // Faster scroll speed when near the very edge

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const componentItems = computed(() => {
    return store.getters["components/componentItems"];
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

    e.dataTransfer.setData("componentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-sidebar");
  };

  const moveComponentItem = async (
    e: any,
    toIndex: number,
    projectId: string
  ) => {
    const componentItemIndex = e.dataTransfer.getData("componentItemIndex");
    if (!componentItemIndex) return;

    const componentItem = componentItems.value[parseInt(componentItemIndex)];
    if (!componentItem || !projectId) return;

    // workspaceComponents.value.push(componentItem);
    // store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    store
      .dispatch("canvas/addComponentToProject", {
        data: {
          componentItem,
          positionIndex: toIndex,
        },
      })
      .then();
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    const isParent = checkIfParentIsBeenDragged(e);
    if (!isParent) return;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-workspace");
  };

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const upsertComponentItem = async (
    e: any,
    toIndex: number,
    projectId: string
  ) => {
    const type = e.dataTransfer.getData("type");

    if (type === "from-sidebar") {
      ui.changeComponentItemsStatus(false);
      removeCurrentFocus();
      removeFocus();
      await moveComponentItem(e, toIndex, projectId);
      // focusComponentElement(toIndex, 0);
    } else {
      const fromComponentItemIndex = e.dataTransfer.getData(
        "fromComponentItemIndex"
      );

      if (!fromComponentItemIndex || !projectId) return;

      changeComponentItemPosition(parseInt(fromComponentItemIndex), toIndex);
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

    // TODO: Might remove this, cos API runs every 5 seconds
    store.dispatch("canvas/updateProjectComponentsAndStyles").then();
  };

  const handleScroll = (event: any) => {
    const currentY = event.clientY;
    const height = window.innerHeight;

    const distanceFromTop = currentY;
    const distanceFromBottom = height - distanceFromTop;

    console.log({ distanceFromTop, distanceFromBottom });

    // Check for extreme edge cases first
    if (distanceFromBottom < BOTTOM_EDGE_THRESHOLD) {
      startScrolling(event, 1, true); // Scroll down fast
    } else if (distanceFromTop < TOP_EDGE_THRESHOLD) {
      startScrolling(event, -1, true); // Scroll up fast
    } else if (distanceFromBottom < BOTTOM_THRESHOLD) {
      startScrolling(event, 1, false); // Normal scroll down
    } else if (distanceFromTop < TOP_THRESHOLD) {
      startScrolling(event, -1, false); // Normal scroll up
    } else {
      stopScrolling();
    }
  };

  const clearAllIntervals = () => {
    // Get the highest timeout ID
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const highestTimeoutId = window.setTimeout(() => {}, 0);

    // Clear all possible interval IDs
    for (let i = 0; i <= highestTimeoutId; i++) {
      window.clearInterval(i);
    }
  };

  const startScrolling2 = (
    event: any,
    direction: number,
    isExtreme: boolean
  ) => {
    if (intervalId.value === null) {
      intervalId.value = window.setInterval(() => {
        const distanceFromTop = event.clientY;
        const height = window.innerHeight;
        const distanceFromBottom = height - distanceFromTop;

        if (!isExtreme) {
          if (direction === 1 && distanceFromBottom > BOTTOM_THRESHOLD) {
            clearAllIntervals();
            intervalId.value = null;
            return;
          }
          if (direction === -1 && distanceFromTop > TOP_THRESHOLD) {
            clearAllIntervals();
            intervalId.value = null;
            return;
          }
        }

        if (isExtreme) {
          if (direction === 1) {
            const remainingScroll =
              document.documentElement.scrollHeight -
              (window.scrollY + window.innerHeight);
            if (remainingScroll <= 0) {
              clearAllIntervals();
              intervalId.value = null;
              return;
            }
          } else {
            if (window.scrollY <= 0) {
              clearAllIntervals();
              intervalId.value = null;
              return;
            }
          }
          console.log("<<<<<<< Extreme speed >>>>>>>>");

          window.scrollBy(0, EXTREME_SCROLL_SPEED * direction);
        } else {
          console.log("<<<<<<< Normal speed >>>>>>>>");

          window.scrollBy(0, NORMAL_SCROLL_SPEED * direction);
        }
      }, SCROLL_INTERVAL);
    }
  };

  const startScrolling = (
    event: any,
    direction: number,
    isExtreme: boolean
  ) => {
    if (intervalId.value === null) {
      intervalId.value = window.setInterval(() => {
        const distanceFromTop = event.clientY;
        const height = window.innerHeight;
        const distanceFromBottom = height - distanceFromTop;

        if (isExtreme) {
          if (direction === 1 && distanceFromBottom > BOTTOM_EDGE_THRESHOLD) {
            // stopScrolling();
            isExtreme = false;

            // return;
          }
          if (direction === -1 && distanceFromTop > TOP_EDGE_THRESHOLD) {
            // stopScrolling();
            isExtreme = false;

            // return;
          }
        }

        if (!isExtreme) {
          if (direction === 1 && distanceFromBottom > BOTTOM_THRESHOLD) {
            stopScrolling();
            return;
          }
          if (direction === -1 && distanceFromTop > TOP_THRESHOLD) {
            stopScrolling();
            return;
          }
        }

        // if (direction === 1) {
        //   // Scroll to bottom
        //   const remainingScroll =
        //     document.documentElement.scrollHeight -
        //     (window.scrollY + window.innerHeight);
        //   if (remainingScroll <= 0) {
        //     stopScrolling();
        //     return;
        //   }
        // } else {
        //   // Scroll to top
        //   if (window.scrollY <= 0) {
        //     stopScrolling();
        //     return;
        //   }
        // }

        if (isExtreme) {
          console.log("<<<<<<< Extreme speed >>>>>>>>");
          window.scrollBy(0, EXTREME_SCROLL_SPEED * direction);
        } else {
          console.log("<<<<<<< Normal speed >>>>>>>>");
          window.scrollBy(0, NORMAL_SCROLL_SPEED * direction);
        }
        // window.scrollBy(0, 20 * direction);
      }, SCROLL_INTERVAL);
    }
  };

  const stopScrolling = () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const highestId = window.setTimeout(() => {}, 0);
    /**
     * Clear all intervals in the window, this might be an issue in the future if we have other intervals running
     * Went with this for now because of the multiple interval ID
     */
    for (let i = 0; i < highestId; i++) {
      window.clearInterval(i);
    }
    intervalId.value = null;

    // if (intervalId.value !== null) {
    //   console.log("Stopping interval with ID:", intervalId.value);
    //   clearInterval(intervalId.value);
    //   intervalId.value = null;
    // }
  };

  return {
    dragComponentItemToCanvas,
    moveComponentItem,
    upsertComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
    handleScroll,
    stopScrolling,
  };
}
