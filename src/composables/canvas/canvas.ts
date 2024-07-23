import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";

const { isObjectsMatched, find, findIndex } = helpers();

export function canvas() {
  const hasWorkspaceComponent = computed(() => {
    return store.getters["canvas/hasWorkspaceComponent"];
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

  const hasProjectChanged = () => {
    if (updatedComponents.value.length > 0) return true;
    const matched = isObjectsMatched(style.value, generalStyle.value);
    return !matched;
  };
  const pushComponentsElementsUpdates = (
    focusedElement: any,
    projectComponentItem: any
  ) => {
    const elementToUpdate = {
      id: focusedElement.id,
      attributes: focusedElement.attributes,
      innerHtml: focusedElement.innerHtml,
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
    hasWorkspaceComponent,
    hasProjectChanged,
    pushComponentsElementsUpdates,
  };
}
