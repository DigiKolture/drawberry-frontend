import store from "@/store";
import { computed } from "vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";

export function focus() {
  const { updateElementDom } = updateDom();
  const {
    addClassToElement,
    removeClassFromElement,
    getComponentElementIndexUsingId,
  } = layers();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const focusedElement = computed(() => {
    return store.getters["canvas/focusedElement"];
  });

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const hasFocused = computed(() => {
    return focusedElement.value !== null && focusedIndex.value !== null;
  });

  const removeFocus = () => {
    store.commit("canvas/SET_FOCUSED_ELEMENT", null);
    store.commit("canvas/SET_FOCUSED_INDEX", null);
  };

  const removeCurrentFocus = () => {
    if (!hasFocused.value) return;
    const focusedComponentItem = workspaceComponents.value[focusedIndex.value];

    const jsonIndex = getComponentElementIndexUsingId(
      focusedComponentItem,
      focusedElement.value.id
    );
    if (jsonIndex < 0) return;

    let focElement = focusedComponentItem.json[jsonIndex];

    if (
      focElement.classes &&
      typeof focElement.classes == "object" &&
      focElement.classes.includes("focus")
    ) {
      focElement = removeClassFromElement(
        focusedComponentItem.json[jsonIndex],
        "focus"
      );
      workspaceComponents.value[focusedIndex.value].html = updateElementDom(
        focusedComponentItem.html,
        focElement
      );
    }
  };

  // This will focus the component on and index and the element index
  const focusComponentElement = (itemIndex: number, jsonIndex = 0) => {
    if (jsonIndex < 0) return;

    const componentItem = workspaceComponents.value[itemIndex];

    componentItem.json[jsonIndex] = addClassToElement(
      componentItem.json[jsonIndex],
      "focus"
    );

    workspaceComponents.value[itemIndex].html = updateElementDom(
      componentItem.html,
      componentItem.json[jsonIndex]
    );
    store.commit("canvas/SET_FOCUSED_ELEMENT", componentItem.json[jsonIndex]);
    store.commit("canvas/SET_FOCUSED_INDEX", itemIndex);
  };

  const removeAllFocus = () => {
    removeCurrentFocus();
    removeFocus();
  };

  return {
    removeFocus,
    removeAllFocus,
    removeCurrentFocus,
    focusComponentElement,
  };
}
