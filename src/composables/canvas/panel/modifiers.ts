import { computed } from "vue";
import store from "@/store";
import { history } from "@/composables/canvas/history";
import { HistoryActionTypes } from "@/store/modules/history/types";

export function modifiers() {
  const { updateHistory } = history();

  const focusedElement = computed(() => {
    return store.getters["canvas/focusedElement"];
  });

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const focusedChildrenElements = computed(
    () => store.getters["canvas/focusedChildrenElements"]
  );
  const workspaceComponents = computed(
    () => store.getters["canvas/workspaceComponents"]
  );

  const getTargetElement = (childId: string, childIndex: number) =>
    childId ? focusedChildrenElements.value[childIndex] : focusedElement.value;

  const updateStyle = (
    style: string,
    value: string | number,
    childIndex = -1
  ) => {
    if (childIndex === -1) {
      console.log({
        style,
        value,
      });
      updateHistory({
        type: HistoryActionTypes.COMPONENT_STYLE,
        componentIndex: focusedIndex.value,
        elementId: focusedElement.value.id,
        modifier: style,
        previousValue: focusedElement.value.attributes.style.value[style],
        value,
      });
      focusedElement.value.attributes.style.value[style] = value;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      console.log({
        style,
        value,
      });
      updateHistory({
        type: HistoryActionTypes.COMPONENT_STYLE,
        componentIndex: focusedIndex.value,
        elementId: focusedChildrenElements.value[childIndex].id,
        modifier: style,
        previousValue:
          focusedChildrenElements.value[childIndex].attributes.style.value[
            style
          ],
        value,
      });
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
      updateHistory({
        type: HistoryActionTypes.COMPONENT_ATTRIBUTE,
        componentIndex: focusedIndex.value,
        elementId: focusedElement.value.id,
        modifier,
        previousValue: focusedElement.value.attributes[modifier].value,
        value,
      });
      focusedElement.value.attributes[modifier].value = value;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      updateHistory({
        type: HistoryActionTypes.COMPONENT_ATTRIBUTE,
        componentIndex: focusedIndex.value,
        elementId: focusedChildrenElements.value[childIndex].id,
        modifier,
        previousValue:
          focusedChildrenElements.value[childIndex].attributes[modifier].value,
        value,
      });
      focusedChildrenElements.value[childIndex].attributes[modifier].value =
        value;
      await store.dispatch(
        "canvas/updateFocusedElement",
        focusedChildrenElements.value[childIndex]
      );
    }
  };

  const updateContent = async (
    modifier: string,
    value: string,
    childIndex = -1
  ) => {
    if (childIndex === -1) {
      focusedElement.value[modifier] = value;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      focusedChildrenElements.value[childIndex][modifier] = value;
      await store.dispatch(
        "canvas/updateFocusedElement",
        focusedChildrenElements.value[childIndex]
      );
    }
  };

  return {
    focusedElement,
    getTargetElement,
    updateStyle,
    updateAttribute,
    updateContent,
  };
}
