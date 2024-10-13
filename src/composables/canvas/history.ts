import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";
import {
  HistoryAction,
  HistoryActionTypes,
  ProjectComponentHistoryAction,
  ProjectGeneralStyleHistoryAction,
} from "@/store/modules/history/types";
import { focus } from "@/composables/canvas/focus";

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

  // Check if its component style/attribute update
  const isComponentUpdate = (
    action: HistoryAction
  ): action is ProjectComponentHistoryAction => {
    return (
      action.componentIndex !== undefined &&
      action.elementId !== undefined &&
      (action.type === HistoryActionTypes.COMPONENT_STYLE ||
        action.type === HistoryActionTypes.COMPONENT_ATTRIBUTE ||
        action.type === HistoryActionTypes.COMPONENT_CONTENT)
    );
  };

  const update = (action: HistoryAction, undo = true) => {
    if (isComponentUpdate(action)) {
      return updateComponent(action, undo);
    } else if (action.type === HistoryActionTypes.PROJECT_STYLE) {
      return updateGeneralStyle(action, undo);
    }
    return null;
  };

  const updateGeneralStyle = (
    action: ProjectGeneralStyleHistoryAction,
    undo: boolean
  ) => {
    const { modifier } = action;
    store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", "style");
    style.value[modifier] = undo ? action.previousValue : action.value;
    return style.value;
  };

  const updateComponent = (
    action: ProjectComponentHistoryAction,
    undo: boolean
  ) => {
    const { type, elementId, componentIndex, modifier } = action;
    const value = undo ? action.previousValue : action.value;
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
    const result = update(lastAction, true);
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
    const result = update(lastAction, false);
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
