import store from "@/store";
import { computed } from "vue";

export function panel() {
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
      attributes: [],
    },
    borders: {
      title: "Borders",
      index: 4,
      styles: ["border-radius"],
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

  const tabStates = computed(() => {
    return store.getters["panel/tabStates"];
  });

  const focusedParentElement = computed(() => {
    return store.getters["canvas/focusedParentElement"];
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

  const hasContent = () => {
    if (!focusedElement.value) return false;
    return focusedElement.value.innerHtml !== null;
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
    return tab.isContent && hasContent();
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

  return {
    showTab,
    isParentAttribute,
    isParentStyle,
    childHasStyle,
    childHasAttribute,
    showStyle,
    hasAttributes,
    hasContent,
    tabsStyles,
    resetTabStates,
  };
}
