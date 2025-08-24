import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";
import { updateDom } from "@/composables/canvas/update_dom";
import { CanvasLoadingState } from "@/store/modules/canvas/types";

const { isObjectsMatched, find, findIndex } = helpers();
const { updateElementDom } = updateDom();

export function canvas() {
  const boxShadow: any = {
    cards: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
    collapsed: "0 0 0 0 rgba(0, 0, 0, 0.0)",
  };
  const borderRadius: any = {
    cards: "8px",
    collapsed: "0px",
  };

  const hasWorkspaceComponent = computed(() => {
    return store.getters["canvas/hasWorkspaceComponent"];
  });

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const canvasLoadState = computed(() => {
    return store.getters["canvas/loadState"];
  });

  const canvasLoading = computed(() => {
    return canvasLoadState.value === CanvasLoadingState.IN_PROGRESS;
  });

  const canvasLoaded = computed(() => {
    return canvasLoadState.value === CanvasLoadingState.SUCCESS;
  });

  const style = computed(() => {
    return store.getters["canvas/style"];
  });

  const generalStyle = computed(() => {
    return store.getters["canvas/generalStyle"];
  });

  const updatedComponents = computed(() => {
    return store.getters["canvas/updatedComponents"];
  });

  const getElementWithComponentIndex = (
    componentIndex: number,
    elementId: string
  ) => {
    const workspaceComponent = workspaceComponents.value[componentIndex];
    const elementIndex = findIndex(workspaceComponent.json, "id", elementId);
    if (elementIndex === null) return null;

    return workspaceComponent.json[elementIndex];
  };

  const hasProjectChanged = () => {
    if (updatedComponents.value.length > 0) {
      return true;
    }
    const matched = isObjectsMatched(style.value, generalStyle.value);
    return !matched;
  };

  const removeClasses = (data: any[]) => {
    return data.map((item) => {
      const { classes, ...rest } = item; // Destructure and remove 'classes'
      return rest;
    });
  };

  const updateComponentBorder = (layout: string, json: any[], html: string) => {
    const componentsStyle = {
      "border-radius": borderRadius[layout],
      "box-shadow": boxShadow[layout],
    };

    const element = json[0];
    element.attributes.style.value = {
      ...element.attributes.style.value,
      ...componentsStyle,
    };

    return {
      html: updateElementDom(html, element),
      json,
    };
  };

  const isRow = (element: any) => {
    let current = element;

    while (current && current.parentElement.hasAttribute("parent")) {
      current = current.parentElement;

      console.log(
        `Current element: ${current.tagName}, Parent ID: ${current.id}`
      );
    }
    const isARow = current.parentElement.classList.contains("row");

    console.log(`Current Parent: ${current.parentElement.id}`);
    return isARow ? current.parentElement.id : null;
  };

  const pushComponentsElementsUpdates = (
    focusedElement: any,
    projectComponentItem: any
  ) => {
    const elementToUpdate = {
      id: focusedElement.id,
      attributes: focusedElement.attributes,
      textContent: focusedElement.textContent,
    };

    const updatedComponent = find(
      updatedComponents.value,
      "projectComponentItemId",
      projectComponentItem.id
    );

    if (!updatedComponent) {
      updatedComponents.value.push({
        projectComponentItemId: projectComponentItem.id,
        elements: [elementToUpdate],
      });
    } else {
      const elements = updatedComponent.elements;
      const updatedElementIndex = findIndex(elements, "id", elementToUpdate.id);
      if (updatedElementIndex === null) {
        elements.push(elementToUpdate);
      } else {
        elements[updatedElementIndex] = elementToUpdate;
      }
    }
    store.commit("canvas/SET_UPDATED_COMPONENTS", updatedComponents.value);
  };

  return {
    canvasLoading,
    hasWorkspaceComponent,
    canvasLoaded,
    hasProjectChanged,
    pushComponentsElementsUpdates,
    updateComponentBorder,
    removeClasses,
    isRow,
    getElementWithComponentIndex,
  };
}
