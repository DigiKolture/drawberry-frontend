import { computed, watch } from "vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import { HistoryActionTypes } from "@/store/modules/history/types";
import store from "@/store";

export function modifiersUpdater(
  props: any,
  name: string,
  type = HistoryActionTypes.COMPONENT_STYLE
) {
  const { getTargetElement, updateAttribute, updateStyle, updateContent } =
    modifiers();
  const breakpoint = computed(() => store.getters["canvas/breakpoint"]);

  const targetElement = computed(() =>
    getTargetElement(props.childId, props.childIndex)
  );

  const modifier = computed({
    get: () => {
      if (type === HistoryActionTypes.COMPONENT_STYLE) {
        const styleValue = targetElement.value?.attributes.style.value[name];
        return styleValue[breakpoint.value];
      } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
        return targetElement.value?.attributes[name]?.value;
      } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
        return targetElement.value[name];
      }
      return "";
    },
    set: (newVal) => {
      if (type === HistoryActionTypes.COMPONENT_STYLE) {
        updateStyle(name, newVal, props.childIndex);
      } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
        updateAttribute(name, newVal, props.childIndex).then();
      } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
        if (newVal === modifier.value) return;
        updateContent(name, newVal, props.childIndex).then();
      }
    },
  });

  watch(targetElement.value, (newElement) => {
    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      modifier.value =
        newElement?.attributes.style.value[name][breakpoint.value];
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      modifier.value = newElement?.attributes[name]?.value;
    } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
      modifier.value = newElement[name];
    }
  });

  return {
    modifier,
  };
}
