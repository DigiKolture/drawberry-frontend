import store from "@/store";
import { computed, ref } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
const { updateHistory } = history();

export function drag_and_drop() {
  const { removeCurrentFocus, removeFocus, removeAllFocus } = focus();

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

    onDragStart(e);

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

  const previousY: any = ref(null); // Stores the previous `clientY` position
  const scrollInterval: any = ref(null); // Manages the scrolling interval
  const direction: any = ref(null); // Tracks the dragging direction
  // const scrollInterval = ref(null);
  const isScrolling = ref(false);
  const onDragStart = (event: any) => {
    previousY.value = event.clientY; // Initialize the starting Y position
    console.log(`previousY`, previousY.value);
    console.log({ previousY: previousY.value });
  };

  const onDrag = (event: any) => {
    const currentY = event.clientY;

    if (previousY.value !== null) {
      direction.value = currentY > previousY.value ? "down" : "up"; // Determine direction
    }
    // console.log({
    //   previousY: previousY.value,
    //   currentY,
    //   direction: direction.value,
    // });

    const container = event.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const mouseY = event.clientY;

    // Calculate distances from top and bottom edges
    const distanceFromTop = mouseY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - mouseY;

    console.log({ distanceFromTop, distanceFromBottom });

    // Update previous position for the next drag event
    previousY.value = currentY;

    if (scrollInterval.value) {
      clearInterval(scrollInterval.value);
      scrollInterval.value = null;
    }

    const scrollThreshold = 60; // Pixels from the viewport edge
    const scrollSpeed = 15; // Speed of scrolling

    if (distanceFromTop < scrollThreshold && window.scrollY > 0) {
      // Scroll up only if we're not at the top
      startScrolling(-1);
    } else if (
      distanceFromBottom < scrollThreshold &&
      window.scrollY <
        document.documentElement.scrollHeight - window.innerHeight
    ) {
      // Scroll down only if we're not at the bottom
      startScrolling(1);
    } else {
      stopScrolling();
    }

    // if (distanceFromTop < scrollThreshold) {
    //   console.log("+++++++++++++ GOING UP +++++++++++++");
    //
    //   // Scroll up
    //   startScrolling(-1);
    // } else if (distanceFromBottom < scrollThreshold) {
    //   // Scroll down
    //   console.log("<<<<<<<< GOING DOWN >>>>>>>>>>>>>");
    //   startScrolling(1);
    // }

    // if (currentY < scrollThreshold && direction.value === "up") {
    //   // Scroll up when dragging upward near the top of the viewport
    //   startScrolling(-scrollSpeed);
    // } else if (
    //   window.innerHeight - currentY < scrollThreshold &&
    //   direction.value === "down"
    // ) {
    //   // Scroll down when dragging downward near the bottom of the viewport
    //   startScrolling(scrollSpeed);
    // } else {
    //   // Stop scrolling if not near the edges
    //   stopScrolling();
    // }
  };

  const onDragEnd = () => {
    // Stop scrolling and reset the previous position on drag end
    stopScrolling();
    previousY.value = null;
    direction.value = null;
  };

  const startScrolling = (direction: any) => {
    if (!isScrolling.value) {
      console.log("------------------------------------");
      isScrolling.value = true;
      scrollInterval.value = setInterval(() => {
        window.scrollBy({
          top: 15 * direction,
          behavior: "auto",
        });
      }, 16); // ~60fps
    } else {
      stopScrolling();
    }
  };

  const stopScrolling = () => {
    if (scrollInterval.value) {
      clearInterval(scrollInterval.value);
      scrollInterval.value = null;
    }
    isScrolling.value = false;
  };

  return {
    dragComponentItemToCanvas,
    moveComponentItem,
    upsertComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
    onDrag,
    onDragStart,
    onDragEnd,
  };
}
