import store from "@/store";
import { computed } from "vue";

export function drag_and_drop() {
  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const componentItems = computed(() => {
    return store.getters["components/componentItems"];
  });

  const dragComponentItemToCanvas = (e: any, itemIndex: any) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("componentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-sidebar");
  };

  const moveComponentItem = async (e: any, projectId: string) => {
    const componentItemIndex = e.dataTransfer.getData("componentItemIndex");
    if (!componentItemIndex) return;

    const componentItem = componentItems.value[parseInt(componentItemIndex)];
    if (!componentItem || !projectId) return;

    // workspaceComponents.value.push(componentItem);
    // store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    // TODO: We will need a loader here
    await store.dispatch("canvas/storeProjectComponent", {
      projectId,
      data: {
        componentItemId: componentItem.id,
        positionIndex: workspaceComponents.value.length,
      },
    });
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-workspace");
  };

  const upsertComponentItem = async (
    e: any,
    toIndex: any,
    projectId: string
  ) => {
    const type = e.dataTransfer.getData("type");

    if (type === "from-sidebar") {
      await moveComponentItem(e, projectId);
    } else {
      const fromComponentItemIndex = e.dataTransfer.getData(
        "fromComponentItemIndex"
      );

      if (!fromComponentItemIndex || !projectId) return;

      await changeComponentItemPosition(
        projectId,
        parseInt(fromComponentItemIndex),
        parseInt(toIndex)
      );
    }
  };

  const changeComponentItemPosition = async (
    projectId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    console.log({ projectId });
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
