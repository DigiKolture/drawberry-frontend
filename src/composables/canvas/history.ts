import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";
import {
  HistoryAction,
  HistoryActionTypes,
} from "@/store/modules/history/types";
import { focus } from "@/composables/canvas/focus";
import * as buffer from "buffer";
import { val } from "cheerio/lib/api/attributes";

const { find, findIndex } = helpers();
const { removeFocus, isElementAlreadyFocused, focusComponentElement } = focus();

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

  /** Check if a duplicate action is about to be logged into the undo stack,
   * this can happen because of the modifier watch that gets triggers after the targetElement watch is triggered after the undo/redo
   *
   * @param action
   */
  const isDuplicateAction = (action: HistoryAction): boolean => {
    if (action.value === action.previousValue) return true;
    const matchingActions = undoStack.value.filter(
      (stack: HistoryAction) =>
        stack.type === action.type &&
        stack.componentIndex === action.componentIndex &&
        stack.elementId === action.elementId
    );

    if (matchingActions.length > 0) {
      const lastAction = matchingActions[matchingActions.length - 1];
      if (
        lastAction.value === action.value &&
        lastAction.previousValue === action.previousValue
      ) {
        return true;
      }
    }

    return false;
  };

  const updateHistory = (action: HistoryAction) => {
    if (isDuplicateAction(action)) {
      return;
    }

    undoStack.value.push(action);

    store.commit("history/SET_UNDO_STACK", undoStack.value);
    store.commit("history/RESET_REDO_STACK");
  };

  const updateComponent = (
    type: string,
    componentIndex: number,
    elementId: string,
    modifier: string,
    value: string | number
  ) => {
    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const elementIndex = findIndex(workspaceComponent.json, "id", elementId);
      if (elementIndex === null) return null;
      const element = workspaceComponent.json[elementIndex];
      element.attributes.style.value[modifier] = value;
      const selectedElementId = element.parent ? element.parent : element.id;
      const selElementIndex = findIndex(
        workspaceComponent.json,
        "id",
        selectedElementId
      );
      if (selElementIndex === null) return null;
      if (!isElementAlreadyFocused(componentIndex, selectedElementId)) {
        focusComponentElement(componentIndex, selElementIndex, true).then();
      }
      return element;
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const elementIndex = findIndex(workspaceComponent.json, "id", elementId);
      if (elementIndex === null) return null;
      const element = workspaceComponent.json[elementIndex];
      element.attributes[modifier].value = value;
      const selectedElementId = element.parent ? element.parent : element.id;
      const selElementIndex = findIndex(
        workspaceComponent.json,
        "id",
        selectedElementId
      );
      if (selElementIndex === null) return null;
      if (!isElementAlreadyFocused(componentIndex, selectedElementId)) {
        focusComponentElement(componentIndex, selElementIndex, true).then();
      }
      return element;
    } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
      const workspaceComponent = workspaceComponents.value[componentIndex];
      const elementIndex = findIndex(workspaceComponent.json, "id", elementId);
      if (elementIndex === null) return null;
      const element = workspaceComponent.json[elementIndex];
      element[modifier] = value;
      const selectedElementId = element.parent ? element.parent : element.id;
      const selElementIndex = findIndex(
        workspaceComponent.json,
        "id",
        selectedElementId
      );
      if (selElementIndex === null) return null;
      if (!isElementAlreadyFocused(componentIndex, selectedElementId)) {
        focusComponentElement(componentIndex, selElementIndex, true).then();
      }
      return element;
    }
    return null;
  };

  const undo = () => {
    if (undoStack.value.length === 0) {
      return;
    }

    const lastAction = undoStack.value.pop();
    const { type, elementId, componentIndex, modifier, previousValue } =
      lastAction;

    const result = updateComponent(
      type,
      componentIndex,
      elementId,
      modifier,
      previousValue
    );
    if (result === null) return;

    // store.commit("canvas/UPDATE_ELEMENT_IN_COMPONENTS_DOM", {
    //   elementId,
    //   componentIndex,
    // });
    redoStack.value.push(lastAction);
    store.commit("history/SET_REDO_STACK", redoStack.value);
  };

  const redo = () => {
    if (redoStack.value.length === 0) {
      return;
    }

    const lastAction: HistoryAction = redoStack.value.pop();
    const { type, elementId, componentIndex, modifier, value } = lastAction;

    const result = updateComponent(
      type,
      componentIndex,
      elementId,
      modifier,
      value
    );

    if (result === null) return;
    // store.commit("canvas/UPDATE_ELEMENT_IN_COMPONENTS_DOM", {
    //   elementId,
    //   componentIndex,
    // });
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
