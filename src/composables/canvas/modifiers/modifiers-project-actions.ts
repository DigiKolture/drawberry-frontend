import { computed } from "vue";
import store from "@/store";
import { history } from "@/composables/canvas/history";
import { focus } from "@/composables/canvas/focus";
import { HistoryActionTypes } from "@/store/modules/history/types";

export function modifiersProjectActions() {
  const { updateHistory } = history();
  const { removeFocus } = focus();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });
  const deleteProjectComponent = (positionIndex: number) => {
    const projectComponent = workspaceComponents.value[positionIndex];

    store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
      id: null,
      componentIndex: null,
    });

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_DELETE,
      projectComponent,
      positionIndex,
      workspaceComponentItemId: projectComponent.id,
    });

    workspaceComponents.value.splice(positionIndex, 1);
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    if (workspaceComponents.value.length == 0) {
      store.commit("SET_HAS_WORKSPACE_COMPONENTS", false);
    }

    //Delete project component from the backend
    store
      .dispatch("canvas/deleteProjectComponent", {
        projectComponentItemId: projectComponent.id,
      })
      .then();

    removeFocus();
  };

  return {
    deleteProjectComponent,
  };
}
