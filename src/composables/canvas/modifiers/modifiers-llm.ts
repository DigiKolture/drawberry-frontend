import { computed } from "vue";
import store from "@/store";
import { history } from "@/composables/canvas/history";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { modifiersProjectActions } from "@/composables/canvas/modifiers/modifiers-project-actions";

export function modifiersLLM() {
  const { updateHistory } = history();
  const { changeComponentItemPosition } = drag_and_drop();
  const { duplicateProjectComponent, deleteProjectComponent } =
    modifiersProjectActions();
  const style = computed(() => store.getters["canvas/style"]);

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const updateStyleLLM = (data: any) => {
    const { modifier, componentIndex, elementId, previousValue, value } = data;
    const projectComponentItem = workspaceComponents.value[componentIndex];
    const jsonIndex = projectComponentItem.json.findIndex(
      (el: any) => el.id === elementId
    );
    if (jsonIndex < 0) return;

    if (data.type === HistoryActionTypes.COMPONENT_STYLE) {
      projectComponentItem.json[jsonIndex].attributes.style.value[modifier] =
        value;
    } else if (data.type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      projectComponentItem.json[jsonIndex].attributes[modifier].value = value;
    } else if (data.type === HistoryActionTypes.COMPONENT_CONTENT) {
      projectComponentItem.json[jsonIndex][modifier] = value;
    }

    store.commit("canvas/UPDATE_ELEMENT_IN_COMPONENTS_DOM", {
      elementId,
      componentIndex,
    });

    updateHistory({
      type: data.type,
      workspaceComponentItemId: workspaceComponents.value[componentIndex].id,
      elementId,
      modifier,
      previousValue,
      value,
    });
  };
  const updateProjectStyleLLM = (data: any) => {
    const { modifier, previousValue, value } = data;
    style.value[modifier] = value;

    //TODO: Might optimize this later, everything here isnt needed if the Sidebar for updating style is opened
    store.commit("canvas/UPDATE_FIRST_PROJECT_COMPONENTS_STYLE", value);
    updateHistory({
      type: HistoryActionTypes.PROJECT_STYLE,
      modifier,
      previousValue,
      value,
    });
    store.dispatch("canvas/updateProjectStyle", style.value).then();
  };

  const duplicateProjectComponentLLM = (data: any) => {
    const { componentIndex, positionIndex } = data;

    duplicateProjectComponent(componentIndex, positionIndex);
  };

  const updateProjectComponentModifyPositionLLM = (data: any) => {
    const { toIndex, positionIndex } = data;

    changeComponentItemPosition(positionIndex, toIndex, false);
  };

  const deleteProjectComponentLLM = (data: any) => {
    const { positionIndex } = data;

    deleteProjectComponent(positionIndex);
  };

  return {
    updateStyleLLM,
    updateProjectStyleLLM,
    duplicateProjectComponentLLM,
    updateProjectComponentModifyPositionLLM,
    deleteProjectComponentLLM,
  };
}
