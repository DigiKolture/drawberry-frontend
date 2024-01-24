import store from "@/store";
import { computed } from "vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";

export function hover() {
  const {
    removeClassFromElement,
    getComponentElementIndexUsingId,
    addClassToElement,
  } = layers();

  const { updateElementDom } = updateDom();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const currentHoverElement = computed(() => {
    return store.getters["canvas/currentHoverElement"];
  });

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const removeHoverElement = () => {
    if (
      currentHoverElement.value.id &&
      currentHoverElement.value.componentIndex !== null &&
      currentHoverElement.value.componentIndex > -1
    ) {
      const currentComponentItem =
        workspaceComponents.value[currentHoverElement.value.componentIndex];

      if (!currentComponentItem) return;

      const jsonIndex = getComponentElementIndexUsingId(
        currentComponentItem,
        currentHoverElement.value.id
      );

      if (jsonIndex < 0) return;
      let currElement = currentComponentItem.json[jsonIndex];

      if (
        currElement.classes &&
        typeof currElement.classes == "object" &&
        currElement.classes.includes("hover")
      ) {
        currElement = removeClassFromElement(
          currentComponentItem.json[jsonIndex]
        );

        workspaceComponents.value[
          currentHoverElement.value.componentIndex
        ].html = updateElementDom(currentComponentItem.html, currElement);
      }
    }
  };

  const addHoverToElement = (
    itemIndex: number,
    elementId: string,
    componentItem: any,
    event: any = null
  ) => {
    const currentFocusedIndex = focusedIndex.value;

    let jsonIndex = 0;
    // if (event.metaKey || event.ctrlKey) {
    //   // return;
    // }

    // If hover os from workspace or current focused component is been hovered on allow children elements to be have the hover class
    if (!event || currentFocusedIndex === itemIndex) {
      jsonIndex = getComponentElementIndexUsingId(componentItem, elementId);
    }

    if (jsonIndex === 0 && currentFocusedIndex === itemIndex) {
      return;
    }

    store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
      id: elementId,
      componentIndex: itemIndex,
    });
    componentItem.json[jsonIndex] = addClassToElement(
      componentItem.json[jsonIndex]
    );
    workspaceComponents.value[itemIndex].html = updateElementDom(
      componentItem.html,
      componentItem.json[jsonIndex]
    );
  };

  const hasWorkspaceComponent = computed(() => {
    return workspaceComponents.value && workspaceComponents.value.length > 0;
  });

  return {
    hasWorkspaceComponent,
    removeHoverElement,
    addHoverToElement,
  };
}
