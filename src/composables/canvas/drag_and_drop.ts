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

    addProjectComponent(componentItem, toIndex);
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    const isParent = checkIfParentIsBeenDragged(e);
    if (!isParent) return;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-workspace");

    //Used for scrolling when component is being dragged
    e.dataTransfer.setData("dragComponentItemHeight", e.target.offsetHeight);
    e.dataTransfer.setData("dragComponentItemOffsetY", e.offsetY);
    e.dataTransfer.setData("dragComponentItemCurrentY", e.clientY);
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

  const handleScroll3 = (event: any) => {
    const fromComponentItemIndex = event.dataTransfer.getData(
      "fromComponentItemIndex"
    );
    const dragElementHeight = event.dataTransfer.getData("dragElementHeight");
    const dragOffsetY = event.dataTransfer.getData("dragOffsetY");
    const dragCurrentY = event.dataTransfer.getData("dragCurrentY");

    if (!fromComponentItemIndex) return;
    // console.log({ draggedIndex: draggedIndex.value });
    // if (draggedIndex.value === null) return;

    const draggedIndex = parseInt(fromComponentItemIndex);

    // Get the element being dragged over
    const target = event.target.closest(
      ".workspace__component__items__list__item"
    );
    if (!target) return;

    // Skip if dragging over itself
    // if (target.id === `workspace-component-item-${draggedIndex}`) return;

    // Get the bounding rectangle of the target element
    const targetRect = target.getBoundingClientRect();

    // console.log({ targetRect: JSON.stringify(targetRect) });

    // Calculate the center point of the dragged element
    // This represents where the dragged element would be positioned
    const draggedElementCenterY =
      event.clientY - dragOffsetY + dragElementHeight / 2;

    // Calculate middle point of the target element
    const targetMiddle = targetRect.top + targetRect.height / 2;

    // Determine if the dragged element's center is above or below the target's middle
    if (draggedElementCenterY < targetMiddle) {
      dropPosition.value = "top";
      // console.log(" <<<<<<<<<<< TOP >>>>>>>>>>>>");
    } else {
      dropPosition.value = "bottom";
      // console.log(" <<<<<<<<<<< BOTTOM >>>>>>>>>>>>");
    }

    const currentY = event.clientY;
    const offsetY = event.offsetY;
    const height = window.innerHeight;

    const distanceFromTop = currentY;
    const distanceFromBottom = height - distanceFromTop;
    const realDistanceFromTop = distanceFromTop - dragOffsetY; // Subtract the offset

    if (
      distanceFromTop < parseInt(dragCurrentY) && // If the item is being dragged up
      realDistanceFromTop < TOP_THRESHOLD // Check if the item is close to the top
    ) {
      console.log("Scroll down >>>>>>>>>>>>>>>");
    }

    console.log({
      dragCurrentY,
      distanceFromTop,
      realDistanceFromTop,
      distanceFromBottom,
      draggedIndex,
      dragElementHeight,
      offsetY,
      dragOffsetY,
    });

    if (distanceFromTop < 65 + 20) {
      console.log("Scroll up >>>>>>>>>>");
    }
  };
  const handleScroll = (event: any) => {
    const fromComponentItemIndex = event.dataTransfer.getData(
      "fromComponentItemIndex"
    );
    const dragElementHeight = event.dataTransfer.getData(
      "dragComponentItemHeight"
    );
    const dragOffsetY = event.dataTransfer.getData("dragComponentItemOffsetY");
    const dragCurrentY = event.dataTransfer.getData(
      "dragComponentItemCurrentY"
    );

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
  const handleScroll2 = (event: any) => {
    const currentY = event.clientY;
    const height = window.innerHeight;

    const distanceFromTop = currentY;
    const distanceFromBottom = height - distanceFromTop;

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

  const startScrolling = (
    event: any,
    direction: number,
    isExtreme: boolean
  ) => {
    if (intervalId.value === null) {
      const intId = window.setInterval(() => {
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
          window.scrollBy(0, EXTREME_SCROLL_SPEED * direction);
        } else {
          window.scrollBy(0, NORMAL_SCROLL_SPEED * direction);
        }
        // window.scrollBy(0, 20 * direction);
      }, SCROLL_INTERVAL);
      intervalId.value = intId;

      scrollIntervalsIds.value.push(intId);
    }
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
    upsertComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
    handleScroll,
    stopScrolling,
  };
}
