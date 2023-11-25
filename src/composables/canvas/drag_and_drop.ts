import store from "@/store";
import { computed } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";

export function drag_and_drop() {
  const { removeCurrentFocus, focusComponentElement } = focus();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const componentItems = computed(() => {
    return store.getters["components/componentItems"];
  });

  const dragComponentItemToCanvas = (e: any, itemIndex: any) => {
    const isDraggableElement = e.target.classList.contains(
      "component__items__list__item"
    );

    if (!isDraggableElement) {
      e.preventDefault();
      return;
    }

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

    // // TODO: We will need a loader here
    await store.dispatch("canvas/storeProjectComponent", {
      projectId,
      data: {
        componentItemId: componentItem.id,
        positionIndex: toIndex,
      },
    });
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
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
      await moveComponentItem(e, toIndex, projectId);
      removeCurrentFocus();
      focusComponentElement(toIndex, 0);
    } else {
      const fromComponentItemIndex = e.dataTransfer.getData(
        "fromComponentItemIndex"
      );

      if (!fromComponentItemIndex || !projectId) return;

      if (toIndex > 0) toIndex = toIndex - 1;

      changeComponentItemPosition(
        projectId,
        parseInt(fromComponentItemIndex),
        toIndex
      );
    }
  };

  const changeComponentItemPosition = async (
    projectId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    if (focusedIndex.value === fromIndex) {
      store.commit("canvas/SET_FOCUSED_INDEX", toIndex);
    }
    const projectComponentItem = workspaceComponents.value[fromIndex];

    workspaceComponents.value.splice(fromIndex, 1);
    workspaceComponents.value.splice(toIndex, 0, projectComponentItem);

    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    await store.dispatch("canvas/updateProjectComponent", {
      projectId,
      projectComponentItemId: projectComponentItem.id,
      data: {
        positionIndex: toIndex,
      },
    });
  };

  return {
    dragComponentItemToCanvas,
    moveComponentItem,
    upsertComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
  };
}
