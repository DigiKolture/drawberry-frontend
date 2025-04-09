import { computed } from "vue";
import store from "@/store";
import { history } from "@/composables/canvas/history";
import { focus } from "@/composables/canvas/focus";
import { HistoryActionTypes } from "@/store/modules/history/types";
import ObjectId from "bson-objectid";
import { project } from "@/composables/project/project";
import { useRoute } from "vue-router";

export function modifiersProjectActions() {
  const { updateHistory } = history();
  const { removeFocus } = focus();
  const { duplicateProjectComponentObj } = project();
  const route = useRoute();

  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  /**
   * @param itemIndex - Component Index to duplicate
   * @param positionIndex - Position to place the duplicated component
   */
  const duplicateProjectComponent = (
    itemIndex: number,
    positionIndex: number
  ) => {
    const projectComponentItem = workspaceComponents.value[itemIndex];

    const newProjectComponentId = new ObjectId().toHexString();
    const projectId = route.params.id as string;

    const projectComponentCleaned = JSON.parse(
      JSON.stringify(projectComponentItem)
    );

    const projectComponent = duplicateProjectComponentObj(
      newProjectComponentId,
      projectId,
      projectComponentCleaned
    );

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE,
      projectComponent,
      positionIndex,
      workspaceComponentItemId: newProjectComponentId,
    });

    workspaceComponents.value.splice(positionIndex, 0, projectComponent);
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);

    //TODO: Might remove this temp since we are calling API every 5 secs
    // store.dispatch("canvas/updateProjectComponentsAndStyles");
  };

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
    duplicateProjectComponent,
    deleteProjectComponent,
  };
}
