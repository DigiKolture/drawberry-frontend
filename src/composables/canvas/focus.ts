import store from "@/store";
import { computed } from "vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";
import { scroll } from "@/composables/canvas/scroll";
import { panel } from "@/composables/canvas/panel";
import { CanvasEditableTypes } from "@/store/modules/canvas/types";

export function focus() {
  const { updateElementDom } = updateDom();
  const { scrollTo: scrollToFtn } = scroll();
  const {
    addClassToElement,
    removeClassFromElement,
    getComponentElementIndexUsingId,
  } = layers();
  const { openModifierTab } = panel();

  enum FOCUS_SCROLL_TYPES {
    FROM_LAYER = "from_layer",
    FROM_WORKSPACE = "from_workspace",
    BOTH = "both",
  }

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

  const isFocusedTheFirstElement = computed(() => {
    if (!hasFocused.value) return false;
    const componentItem = workspaceComponents.value[focusedIndex.value];
    const firstElement = componentItem.json[0];
    return focusedElement.value.id === firstElement.id;
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

  const calculateOffset = (item: any) => {
    const headerHeight = 64;
    const topPadding = 40;
    const bottomPadding = 80;

    // Calculate the position to scroll to
    const itemTopPosition =
      item.getBoundingClientRect().top + window.pageYOffset;
    const itemBottomPosition =
      item.getBoundingClientRect().bottom + window.pageYOffset;
    const viewHeight = window.innerHeight;

    // Calculate the offset positions considering header, footer, and padding
    let offsetPosition = itemTopPosition - headerHeight - topPadding;

    if (itemBottomPosition + bottomPadding > window.pageYOffset + viewHeight) {
      offsetPosition = itemBottomPosition - viewHeight + bottomPadding;
    }

    return offsetPosition;
  };

  const scrollTo = (itemIndex: number, id: string) => {
    // TODO: Come back to this
    scrollToFtn(`#layer-component-item-${itemIndex} #${id}`);
    scrollToFtn(`#workspace-component-item-${itemIndex} #${id}`);
    //NOT IN USE
    // if (scrollType === FOCUS_SCROLL_TYPES.FROM_WORKSPACE) {
    //   scrollToFtn(`#layer-component-item-${itemIndex} #${id}`);
    // } else if (scrollType === FOCUS_SCROLL_TYPES.FROM_LAYER) {
    //   scrollToFtn(`#workspace-component-item-${itemIndex} #${id}`);
    // } else {
    //   scrollToFtn(`#layer-component-item-${itemIndex} #${id}`);
    //   scrollToFtn(`#workspace-component-item-${itemIndex} #${id}`);
    // }
    // if (modifier) {
    //   scrollToFtn(`#panel-tab-${itemIndex} #${modifier}`);
    // }
  };

  // Function 1: Get children elements from component
  const getParentChildrenElements = (
    focusedElement: any,
    componentItem: any
  ) => {
    const childIds = focusedElement.children;
    const children = [];

    if (childIds.length > 0) {
      for (const childId of childIds) {
        const jsonIndex = getComponentElementIndexUsingId(
          componentItem,
          childId
        );
        children.push(componentItem.json[jsonIndex]);
      }
    }

    return children;
  };

  // Function 2: Set parent focused element (uses the above function)
  const setParentFocusedElement = (focusedElement: any, componentItem: any) => {
    const children = getParentChildrenElements(focusedElement, componentItem);
    store.commit("canvas/SET_FOCUSED_CHILDREN_ELEMENTS", children);
  };

  const isElementAlreadyFocused = (
    componentIndex: number,
    elementId: string
  ) => {
    return (
      focusedIndex.value === componentIndex &&
      focusedElement.value.id === elementId
    );
  };

  // This will focus the component on and index and the element index
  const focusComponentElement = async (
    itemIndex: number,
    jsonIndex = 0,
    scrollType: FOCUS_SCROLL_TYPES = FOCUS_SCROLL_TYPES.FROM_WORKSPACE,
    focusType: CanvasEditableTypes = CanvasEditableTypes.STYLE,
    modifier = ""
  ) => {
    if (jsonIndex < 0) return;

    removeCurrentFocus();

    store.commit("modals/CLOSE_MODAL", "manage_esp");

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

    //if the focus is happening from undo/redo then dont activate first layer tab
    if (scrollType !== FOCUS_SCROLL_TYPES.BOTH) {
      store.commit("panel/ACTIVATE_FIRST_TAB_STATE");
    } else {
      openModifierTab(focusType, modifier);
    }

    if (
      scrollType === FOCUS_SCROLL_TYPES.BOTH ||
      scrollType === FOCUS_SCROLL_TYPES.FROM_WORKSPACE
    ) {
      await store.dispatch("canvas/setSidebarNavbarContent", "layers");
    }

    scrollTo(itemIndex, focusedElement.id);
  };

  const updateFocusedElementDomAndScroll = async (
    itemIndex: number,
    element: any,
    type: CanvasEditableTypes,
    modifier = ""
  ) => {
    store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", element);
    // TODO: Check if its in view before scrolling
    scrollTo(itemIndex, element.id);
    openModifierTab(type, modifier);
  };

  const removeAllFocus = () => {
    removeCurrentFocus();
    removeFocus();
  };

  return {
    FOCUS_SCROLL_TYPES,
    removeFocus,
    isElementAlreadyFocused,
    removeAllFocus,
    removeCurrentFocus,
    focusComponentElement,
    scrollTo,
    isFocusedTheFirstElement,
    getParentChildrenElements,
    updateFocusedElementDomAndScroll,
  };
}
