import store from "@/store";
import { computed } from "vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";

export function hover() {
  const { removeClassFromElement, getComponentElementIndexUsingId } = layers();

  const { updateElementDom } = updateDom();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const currentHoverElement = computed(() => {
    return store.getters["canvas/currentHoverElement"];
  });

  const removeHoverElement = async () => {
    if (
      currentHoverElement.value.id &&
      currentHoverElement.value.componentIndex !== null &&
      currentHoverElement.value.componentIndex > -1
    ) {
      const currentComponentItem =
        workspaceComponents.value[currentHoverElement.value.componentIndex];

      const jsonIndex = getComponentElementIndexUsingId(
        currentComponentItem,
        currentHoverElement.value.id
      );

      if (jsonIndex > -1) {
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
    }
  };

  const hasWorkspaceComponent = computed(() => {
    return workspaceComponents.value && workspaceComponents.value.length > 0;
  });

  return {
    hasWorkspaceComponent,
    removeHoverElement,
  };
}
