import { helpers } from "@/composables/helpers";
import { computed } from "vue";
import store from "@/store";

export function layers() {
  const { sliceString } = helpers();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });
  const getLayerElementTitle = (element: any): string => {
    const id = element.id.toLowerCase();
    const text = element.innerHtml
      ? element.innerHtml.trim()
      : element.innerHtml;

    if (text) {
      return sliceString(text, 16);
    } else if (id.includes("background")) {
      return "Background";
    } else if (id.includes("logo")) {
      return "Logo";
    } else if (id.includes("image")) {
      return "Image";
    }

    const splitArray = id.split("_");
    return splitArray.length > 1 ? sliceString(splitArray[1]) : sliceString(id);
  };

  const getLayerElementIcon = (element: any): string => {
    const id = element.id.toLowerCase();
    const text = element.innerHtml;
    let icon = "";
    if (text) {
      icon = "text";
    } else if (id.includes("background")) {
      icon = "background";
    } else if (id.includes("logo")) {
      icon = "image";
    } else if (id.includes("image")) {
      icon = "image";
    } else {
      icon = "text";
    }
    return `canvas/sidebar/layers/${icon}`;
  };

  const getComponentElementIndexUsingId = (
    componentItem: any,
    elementId: string
  ) => {
    const jsonIndex = componentItem.json.findIndex(
      (el: any) => el.id == elementId
    );
    return jsonIndex;
  };

  const addHoverClassToElement = (element: any) => {
    element.classes =
      element.classes &&
      element.classes.value &&
      typeof element.classes.value === "object"
        ? element.classes.value.push("hover")
        : ["hover"];

    return element;
  };

  const addClassToElement = (element: any, className = "hover") => {
    element.classes =
      element.classes &&
      element.classes.value &&
      typeof element.classes.value === "object"
        ? element.classes.value.push(className)
        : [className];

    return element;
  };

  const removeHoverClassFromElement = (element: any) => {
    element.classes =
      element.classes &&
      typeof element.classes === "object" &&
      element.classes.includes("hover")
        ? element.classes.filter((classs: string) => classs !== "hover")
        : element.classes;
    return element;
  };

  const removeClassFromElement = (element: any, className = "hover") => {
    element.classes =
      element.classes &&
      typeof element.classes === "object" &&
      element.classes.includes(className)
        ? element.classes.filter((classs: string) => classs !== className)
        : element.classes;
    return element;
  };

  const resetTabStates = () => {
    const indices: Record<string, boolean> = {};
    for (let i = 0; i < workspaceComponents.value.length; i++) {
      indices[i.toString()] = false;
    }
    return indices;
  };

  return {
    getLayerElementTitle,
    getLayerElementIcon,
    getComponentElementIndexUsingId,
    addHoverClassToElement,
    removeClassFromElement,
    addClassToElement,
    removeHoverClassFromElement,
    resetTabStates,
  };
}
