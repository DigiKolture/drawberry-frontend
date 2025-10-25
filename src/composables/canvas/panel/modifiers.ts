import { computed } from "vue";
import store from "@/store";
import { history } from "@/composables/canvas/history";
import { HistoryActionTypes } from "@/store/modules/history/types";

export function modifiers() {
  const { updateHistory } = history();

  const focusedElement = computed(() => {
    return store.getters["canvas/focusedElement"];
  });

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const focusedIndex = computed(() => {
    return store.getters["canvas/focusedIndex"];
  });

  const breakpoint = computed(() => store.getters["canvas/breakpoint"]);

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
      updateHistory({
        type: HistoryActionTypes.COMPONENT_STYLE,
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
        elementId: focusedElement.value.id,
        modifier: style,
        previousValue:
          focusedElement.value.attributes.style.value[style][breakpoint.value],
        value,
        breakpoint: breakpoint.value,
      });
      focusedElement.value.attributes.style.value[style][breakpoint.value] =
        value;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    } else {
      updateHistory({
        type: HistoryActionTypes.COMPONENT_STYLE,
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
        elementId: focusedChildrenElements.value[childIndex].id,
        modifier: style,
        previousValue:
          focusedChildrenElements.value[childIndex].attributes.style.value[
            style
          ][breakpoint.value],
        value,
        breakpoint: breakpoint.value,
      });
      focusedChildrenElements.value[childIndex].attributes.style.value[style][
        breakpoint.value
      ] = value;
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
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
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
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
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
      updateHistory({
        type: HistoryActionTypes.COMPONENT_CONTENT,
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
        elementId: focusedElement.value.id,
        modifier,
        previousValue: focusedElement.value[modifier],
        value,
      });
      focusedElement.value[modifier] = value;
      store
        .dispatch("canvas/updateFocusedElement", focusedElement.value)
        .then();
    } else {
      updateHistory({
        type: HistoryActionTypes.COMPONENT_CONTENT,
        workspaceComponentItemId:
          workspaceComponents.value[focusedIndex.value].id,
        elementId: focusedElement.value.id,
        modifier,
        previousValue: focusedChildrenElements.value[childIndex][modifier],
        value,
      });
      focusedChildrenElements.value[childIndex][modifier] = value;
      store
        .dispatch(
          "canvas/updateFocusedElement",
          focusedChildrenElements.value[childIndex]
        )
        .then();
    }
  };

  return {
    focusedElement,
    focusedChildrenElements,
    getTargetElement,
    updateStyle,
    updateAttribute,
    updateContent,
  };
}
