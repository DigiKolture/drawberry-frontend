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
    // console.log("DRAG FROM SIDBAR TO WORKSPACE >>>>>>>>>> 1");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("componentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-sidebar");
  };

  const moveComponentItem = (e: any) => {
    // console.log("PASTE FROM SIDBAR TO WORKSPACE >>>>>>>>>> 1");
    // const componentItemId = e.dataTransfer.getData("componentItemId");
    const componentItemIndex = e.dataTransfer.getData("componentItemIndex");

    if (!componentItemIndex) return;

    const componentItem = componentItems.value[parseInt(componentItemIndex)];

    if (componentItem) {
      workspaceComponents.value.push(componentItem);
      // console.log({ workspaceComponents: workspaceComponents.value });
      // console.log({ componentItem: componentItem, componentItemIndex });
      store.commit(
        "canvas/SET_WORKSPACE_COMPONENTS",
        workspaceComponents.value
      );
    }
  };

  const moveComponentItemPosition = (e: any, itemIndex: any) => {
    // console.log("DRAG POSITION OF COMPONENT ITEMS >>>> 2");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";

    e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
    e.dataTransfer.setData("type", "from-workspace");
  };

  const changeComponentItemPosition = (e: any, toIndex: any) => {
    const type = e.dataTransfer.getData("type");

    if (type === "from-sidebar") {
      moveComponentItem(e);
    } else {
      // console.log("CHANGE POSITION OF COMPONENT ITEMS >>>> 2");
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
