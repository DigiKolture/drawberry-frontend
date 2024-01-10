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

  const scrollTo = (itemIndex: number, toLayer = true) => {
    let item = null;
    if (toLayer) {
      item = document.querySelector(`#layer-component-item-${itemIndex}`);
    } else {
      item = document.querySelector(`#workspace-component-item-${itemIndex}`);
    }
    item?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const setParentFocusedElement = (focusedElement: any, componentItem: any) => {
    if (focusedElement.parentId) {
      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        focusedElement.parentId
      );
      store.commit(
        "canvas/SET_FOCUSED_PARENT_ELEMENT",
        componentItem.json[jsonIndex]
      );
    } else {
      store.commit("canvas/SET_FOCUSED_PARENT_ELEMENT", null);
    }
  };

  // This will focus the component on and index and the element index
  const focusComponentElement = async (
    itemIndex: number,
    jsonIndex = 0,
    fromWorkspace = true
  ) => {
    if (jsonIndex < 0) return;

    // Close all the panel styles on the right before opening a new one. This prevents prev styles from showing before new one are loaded
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        store.commit("panel/DELETE_ALL_TAB_STATES");
        resolve();
      });
    });

    const componentItem = workspaceComponents.value[itemIndex];

    componentItem.json[jsonIndex] = addClassToElement(
      componentItem.json[jsonIndex],
      "focus"
    );

    workspaceComponents.value[itemIndex].html = updateElementDom(
      componentItem.html,
      componentItem.json[jsonIndex]
    );

    const focusedElement = componentItem.json[jsonIndex];
    store.commit("canvas/SET_FOCUSED_ELEMENT", focusedElement);
    store.commit("canvas/SET_FOCUSED_INDEX", itemIndex);

    setParentFocusedElement(focusedElement, componentItem);

    store.commit("layers/SET_ACTIVE_TAB_STATE", itemIndex);

    store.commit("panel/RESET_TAB_STATES");
    store.commit("panel/ACTIVATE_FIRST_TAB_STATE");

    if (fromWorkspace) {
      await store.dispatch("canvas/setSidebarNavbarContent", "layers");
    }

    scrollTo(itemIndex, fromWorkspace);
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
    scrollTo,
  };
}
