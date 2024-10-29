import store from "@/store";
import { computed } from "vue";
import { scroll } from "@/composables/canvas/scroll";
import { CanvasEditableTypes } from "@/store/modules/canvas/types";

export function panel() {
  const { scrollTo } = scroll();

  interface TabStyles {
    title: string;
    index: number;
    styles: string[];
    attributes: string[];
    isContent?: boolean;
  }

  const tabsStyles: Record<string, TabStyles> = {
    layout: {
      title: "Layout",
      index: 0,
      styles: [],
      attributes: ["align", "valign"],
    },
    spacing: {
      title: "Spacing",
      index: 1,
      styles: ["padding", "margin-top", "margin-bottom"],
      attributes: [],
    },
    typography: {
      title: "Typography",
      index: 2,
      styles: [
        "color",
        "font-size",
        "font-weight",
        "line-height",
        "letter-spacing",
        "text-align",
        "font-family",
      ],
      attributes: [],
      isContent: true,
    },
    background: {
      title: "Background",
      index: 3,
      styles: ["background-color"],
      attributes: ["background"],
    },
    borders: {
      title: "Borders",
      index: 4,
      styles: ["border-radius", "border-top"],
      attributes: [],
    },
    effects: {
      title: "Effects",
      index: 5,
      styles: ["box-shadow"],
      attributes: [],
    },
    link: {
      title: "Link",
      index: 6,
      styles: [],
      attributes: ["href"],
    },
    media: {
      title: "Media",
      index: 7,
      styles: [],
      attributes: ["src"],
    },
  };

  const focusedElement = computed(() => {
    return store.getters["canvas/focusedElement"];
  });

  const focusedChildrenElements = computed(() => {
    return store.getters["canvas/focusedChildrenElements"];
  });

  const styles = computed(() => {
    return Object.keys(focusedElement.value?.attributes?.style?.value || []);
  });

  const parentStyles = computed(() => {
    let keys: string[] = [];
    for (const focusedChild of focusedChildrenElements.value) {
      keys = keys.concat(
        Object.keys(focusedChild.attributes?.style?.value || [])
      );
    }
    return keys;
  });

  const isParentStyle = (style: string) => {
    return !!(style && parentStyles.value.includes(style));
  };

  const attributes = computed(() => {
    return Object.keys(focusedElement.value?.attributes || {});
  });

  // const parentAttributes = computed(() => {
  //   return Object.keys(focusedParentElement.value?.attributes || {});
  // });

  const parentAttributes = computed(() => {
    let keys: string[] = [];
    for (const focusedChild of focusedChildrenElements.value) {
      keys = keys.concat(Object.keys(focusedChild.attributes));
    }
    return keys;
  });

  const isParentAttribute = (attribute: string) => {
    return !!(attribute && parentAttributes.value.includes(attribute));
  };

  const showStyle = (style: string) => {
    return style ? styles.value.includes(style) : true;
  };

  const childHasStyle = (index: number, style: string) => {
    const childStyles =
      focusedChildrenElements.value?.[index]?.attributes?.style?.value || {};
    return Object.keys(childStyles).includes(style);
  };

  const childHasAttribute = (index: number, attribute: string) => {
    const childAttributes =
      focusedChildrenElements.value?.[index]?.attributes || {};
    return Object.keys(childAttributes).includes(attribute);
  };

  const hasCurrentOrChildrenStyles = (style: string) => {
    return style
      ? styles.value.includes(style) || parentStyles.value.includes(style)
      : true;
  };

  // const showStyle = (style: string) => {
  //   return style ? styles.value.includes(style) : true;
  // };

  const hasCurrentOrChildrenAttributes = (attribute: string) => {
    return attribute
      ? attributes.value.includes(attribute) ||
          parentAttributes.value.includes(attribute)
      : true;
  };

  const hasAttributes = (attribute: string) => {
    return attributes.value.includes(attribute);
  };

  const hasParentContents = () => {
    for (const focusedChild of focusedChildrenElements.value) {
      if (focusedChild.textContent !== null) {
        return true;
      }
    }
    return false;
  };

  const hasContent = () => {
    if (!focusedElement.value) return false;
    return focusedElement.value.textContent !== null;
  };

  const hasChildOrParentContent = () => {
    return hasContent() || hasParentContents();
  };

  const childHasContent = (index: number) => {
    const childContent = focusedChildrenElements.value?.[index];
    if (!childContent) return false;
    return childContent.textContent !== null;
  };

  const showTab = (tab: TabStyles) => {
    for (const style of tab.styles) {
      const hasStyle = hasCurrentOrChildrenStyles(style);
      if (hasStyle) return true;
    }
    for (const attr of tab.attributes) {
      const hasAttr = hasCurrentOrChildrenAttributes(attr);
      if (hasAttr) return true;
    }
    // return tab.isContent;
    return tab.isContent && hasChildOrParentContent();
  };

  const resetTabStates = () => {
    const indices: Record<string, boolean> = {};
    for (const key in tabsStyles) {
      const tab = tabsStyles[key];
      if (showTab(tab)) {
        indices[tab.index.toString()] = false;
      }
    }
    return indices;
  };

  const getIndexOfTab = (
    type: CanvasEditableTypes,
    name = ""
  ): number | null => {
    for (const key in tabsStyles) {
      const tab = tabsStyles[key];

      if (
        type === CanvasEditableTypes.STYLE &&
        name &&
        tab.styles.includes(name)
      ) {
        return tab.index;
      }

      if (
        type === CanvasEditableTypes.ATTRIBUTE &&
        name &&
        tab.attributes.includes(name)
      ) {
        return tab.index;
      }

      if (type === CanvasEditableTypes.CONTENT && tab.isContent) {
        return tab.index;
      }
    }
    return null; // Return null if not found
  };

  const openModifierTab = (type: CanvasEditableTypes, modifier = "") => {
    const index = getIndexOfTab(type, modifier);
    if (index === null) return;
    store.commit("panel/SET_ACTIVE_TAB_STATE", index.toString());
    setTimeout(() => {
      // modifier =
      //   modifier === "textContent" ? CanvasEditableTypes.CONTENT : modifier;
      scrollTo(`#panel-tab-${index} #${modifier ? modifier : type}`); //If modifier is empty use type, this will work for content scenario
    }, 0);
  };

  return {
    showTab,
    isParentAttribute,
    isParentStyle,
    hasCurrentOrChildrenStyles,
    childHasStyle,
    childHasAttribute,
    showStyle,
    hasAttributes,
    hasContent,
    childHasContent,
    tabsStyles,
    getIndexOfTab,
    resetTabStates,
    openModifierTab,
  };
}
