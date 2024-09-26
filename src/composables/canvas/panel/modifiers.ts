import { computed } from "vue";
import store from "@/store";

export function modifiers() {
  const focusedElement = computed(() => {
    return store.getters["canvas/focusedElement"];
  });

  const focusedChildrenElements = computed(
    () => store.getters["canvas/focusedChildrenElements"]
  );

  const getTargetElement = (childId: string, childIndex: number) =>
    childId ? focusedChildrenElements.value[childIndex] : focusedElement.value;

  const updateStyle = (
    style: string,
    value: string | number,
    childIndex = -1
  ) => {
    if (childIndex === -1) {
      focusedElement.value.attributes.style.value[style] = value;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      focusedChildrenElements.value[childIndex].attributes.style.value[style] =
        value;
      store.dispatch(
        "canvas/updateFocusedElement",
        focusedChildrenElements.value[childIndex]
      );
    }
  };

  const updateAttribute = async (
    modifier: string,
    value: string,
    childIndex = -1
  ) => {
    if (childIndex === -1) {
      focusedElement.value.attributes[modifier].value = value;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      focusedChildrenElements.value[childIndex].attributes[modifier].value =
        value;
      await store.dispatch(
        "canvas/updateFocusedElement",
        focusedChildrenElements.value[childIndex]
      );
    }
  };

  return { focusedElement, getTargetElement, updateStyle, updateAttribute };
}
