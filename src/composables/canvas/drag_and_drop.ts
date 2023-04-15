import store from "@/store";
import { computed } from "vue";
import { useRoute } from "vue-router";

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
    if (!componentItem) return;

    if (!projectId) return;
    // workspaceComponents.value.push(componentItem);

    await store.dispatch("canvas/storeProjectComponent", {
      projectId,
      data: {
        componentItemId: componentItem.id,
        positionIndex: workspaceComponents.value.length,
      },
    });

    // store.commit(
    //   "canvas/SET_WORKSPACE_COMPONENTS",
    //   workspaceComponents.value
    // );
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    // console.log("DRAG POSITION OF COMPONENT ITEMS >>>> 2");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-workspace");
  };

  const changeComponentItemPosition = async (
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

      if (!fromComponentItemIndex) return;
      const componentItem =
        workspaceComponents.value[parseInt(fromComponentItemIndex)];

      workspaceComponents.value.splice(parseInt(fromComponentItemIndex), 1);
      workspaceComponents.value.splice(parseInt(toIndex), 0, componentItem);

      store.commit(
        "canvas/SET_WORKSPACE_COMPONENTS",
        workspaceComponents.value
      );
    }
  };

  return {
    dragComponentItemToCanvas,
    moveComponentItem,
    moveComponentItemPosition,
    changeComponentItemPosition,
  };
}
