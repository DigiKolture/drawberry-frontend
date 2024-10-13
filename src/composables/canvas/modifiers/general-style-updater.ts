import { computed, watch } from "vue";
import { HistoryActionTypes } from "@/store/modules/history/types";
import store from "@/store";
import { history } from "@/composables/canvas/history";

export function generalStyleUpdater(name: string) {
  const style = computed(() => store.getters["canvas/style"]);
  const { updateHistory } = history();

  const modifier = computed({
    get: () => {
      return style.value[name];
    },
    set: (newVal) => {
      updateGeneralStyle(name, newVal);
    },
  });

  watch(style.value, (updatedStyle) => {
    modifier.value = updatedStyle[name];
  });

  const updateGeneralStyle = (modifier: string, value: string) => {
    updateHistory({
      type: HistoryActionTypes.PROJECT_STYLE,
      modifier,
      previousValue: style.value[name],
      value,
    });
    style.value[name] = value;
    store.dispatch("canvas/updateProjectStyle", style.value).then();
  };

  return {
    modifier,
  };
}
