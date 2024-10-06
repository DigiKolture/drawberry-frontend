import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";
import {
  HistoryAction,
  HistoryActionTypes,
} from "@/store/modules/history/types";

const { find } = helpers();

export function history() {
  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const undoStack = computed(() => {
    return store.getters["history/undoStack"];
  });

  const canUndo = computed(() => {
    return undoStack.value.length > 0;
  });

  const redoStack = computed(() => {
    return store.getters["history/redoStack"];
  });

  const canRedo = computed(() => {
    return redoStack.value.length > 0;
  });

  const style = computed(() => {
    return store.getters["canvas/style"];
  });

  const updateHistory = (action: HistoryAction) => {
    undoStack.value.push(action);

    store.commit("history/SET_UNDO_STACK", undoStack.value);
    store.commit("history/RESET_REDO_STACK");
  };

  const undo = () => {
    if (undoStack.value.length === 0) {
      return;
    }

    const lastAction = undoStack.value.pop();
    const { type, elementId, componentIndex, modifier, previousValue } =
      lastAction;

    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const element = find(workspaceComponent.json, "id", elementId);
      element.attributes.style.value[modifier] = previousValue;
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const element = find(workspaceComponent.json, "id", elementId);
      element.attributes[modifier].value = previousValue;
    }

    store.commit("canvas/UPDATE_ELEMENT_IN_COMPONENTS", {
      elementId,
      componentIndex,
    });
    redoStack.value.push(lastAction);
    store.commit("history/SET_REDO_STACK", redoStack.value);
  };

  const redo = () => {
    if (redoStack.value.length === 0) {
      return;
    }

    const lastAction: HistoryAction = redoStack.value.pop();
    const { type, elementId, componentIndex, modifier, value } = lastAction;

    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const element = find(workspaceComponent.json, "id", elementId);
      element.attributes.style.value[modifier] = value;
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const element = find(workspaceComponent.json, "id", elementId);
      element.attributes[modifier].value = value;
    }

    store.commit("canvas/UPDATE_ELEMENT_IN_COMPONENTS", {
      elementId,
      componentIndex,
    });
    undoStack.value.push(lastAction);
    store.commit("history/SET_UNDO_STACK", undoStack.value);
  };

  return {
    updateHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
