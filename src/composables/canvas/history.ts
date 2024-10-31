import store from "@/store";
import { computed } from "vue";
import { helpers } from "@/composables/helpers";
import ObjectId from "bson-objectid";

import {
  HistoryAction,
  HistoryActionTypes,
  ProjectComponentAddDeleteHistoryAction,
  ProjectComponentHistoryAction,
  ProjectComponentModifyPositionHistoryAction,
  ProjectGeneralStyleHistoryAction,
} from "@/store/modules/history/types";
import { focus } from "@/composables/canvas/focus";
import { CanvasEditableTypes } from "@/store/modules/canvas/types";

const { findIndex } = helpers();
const {
  isElementAlreadyFocused,
  focusComponentElement,
  updateFocusedElementDomAndScroll,
  FOCUS_SCROLL_TYPES,
} = focus();

export function history() {
  //Modifiers that need to be treated as special cases
  const SPECIAL_MODIFIERS = [
    //For component style
    "textContent",
    "border-radius",
    "padding",
    "background-color",
    "box-shadow",
    "color",
    "border-top",

    //For project style
    "backgroundColor",
    "previewText",
  ];

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
    if (
      (isComponentUpdate(action) ||
        action.type === HistoryActionTypes.PROJECT_STYLE) &&
      action.value === action.previousValue
    )
      return true;

    if (isComponentUpdate(action)) {
      const matchingActions = undoStack.value.filter(
        (stack: HistoryAction) =>
          stack.type === action.type &&
          stack.workspaceComponentItemId === action.workspaceComponentItemId &&
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
    }

    return false;
  };

  const updateHistory = (action: HistoryAction) => {
    if (isDuplicateAction(action)) {
      return;
    }
    action.id = new ObjectId().toHexString();
    const lastUndo = undoStack.value[undoStack.value.length - 1];
    //Dont log the action if its a special modifier and the last undo action is the same component action
    if (
      lastUndo &&
      isComponentActionsEqual(action, lastUndo) &&
      SPECIAL_MODIFIERS.includes(action.modifier) &&
      isRecentComponentAction(lastUndo)
    ) {
      lastUndo.value = action.value;
      lastUndo.timestamp = Date.now();
    } else {
      action.timestamp = Date.now();
      undoStack.value.push(action);
    }

    // If undoStack is more than maxUndo, take the last n changes
    const maxUndo = 40;
    if (undoStack.value.length > maxUndo) {
      store.commit("history/SET_UNDO_STACK", undoStack.value.slice(-maxUndo));
    } else {
      store.commit("history/SET_UNDO_STACK", undoStack.value);
    }
    store.commit("history/RESET_REDO_STACK");
  };

  // Check if its component style/attribute update
  const isComponentUpdate = (
    action: HistoryAction
  ): action is ProjectComponentHistoryAction => {
    return (
      (action.type === HistoryActionTypes.COMPONENT_STYLE ||
        action.type === HistoryActionTypes.COMPONENT_ATTRIBUTE ||
        action.type === HistoryActionTypes.COMPONENT_CONTENT) &&
      action.workspaceComponentItemId !== undefined &&
      action.elementId !== undefined
    );
  };

  const isProjectComponentStyleActionsEqual = (
    action: HistoryAction,
    action2: HistoryAction
  ): action is ProjectGeneralStyleHistoryAction => {
    // Check if both actions are same component element updates
    return (
      action.type === HistoryActionTypes.PROJECT_STYLE &&
      action2.type === HistoryActionTypes.PROJECT_STYLE &&
      action.type === action2.type &&
      action.modifier === action2.modifier
    );
  };
  const isComponentModifierActionsEqual = (
    action: HistoryAction,
    action2: HistoryAction
  ): action is ProjectComponentHistoryAction => {
    // Check if both actions are same component element updates
    return (
      isComponentUpdate(action) &&
      isComponentUpdate(action2) &&
      action.type === action2.type &&
      action.workspaceComponentItemId === action2.workspaceComponentItemId &&
      action.elementId === action2.elementId &&
      action.modifier === action2.modifier
    );
  };

  const isComponentActionsEqual = (
    action: HistoryAction,
    action2: HistoryAction
  ): action is
    | ProjectComponentHistoryAction
    | ProjectGeneralStyleHistoryAction => {
    // Check if both actions are same component element updates
    return (
      isComponentModifierActionsEqual(action, action2) ||
      isProjectComponentStyleActionsEqual(action, action2)
    );
  };

  const isRecentComponentAction = (action: HistoryAction) => {
    if (!action.timestamp) return false;
    const differenceInSeconds = (Date.now() - action.timestamp) / 1000;
    return differenceInSeconds < 3;
  };
  const update = (action: HistoryAction, undo = true) => {
    if (isComponentUpdate(action)) {
      return updateComponent(action, undo);
    } else if (action.type === HistoryActionTypes.PROJECT_STYLE) {
      return updateGeneralStyle(action, undo);
    } else if (
      action.type === HistoryActionTypes.PROJECT_COMPONENT_ADD ||
      action.type === HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE
    ) {
      return updateProjectComponentAdd(action, undo);
    } else if (action.type === HistoryActionTypes.PROJECT_COMPONENT_DELETE) {
      return updateProjectComponentDelete(action, undo);
    } else if (
      action.type === HistoryActionTypes.PROJECT_COMPONENT_MODIFY_POSITION
    ) {
      return updateProjectComponentModifiyPosition(action, undo);
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

  const updateProjectComponentAdd = (
    action: ProjectComponentAddDeleteHistoryAction,
    undo: boolean
  ) => {
    const { workspaceComponentItemId, positionIndex } = action;
    if (undo) {
      // Delete the component
      const componentIndex = findIndex(
        workspaceComponents.value,
        "id",
        workspaceComponentItemId
      );
      if (componentIndex === null) return null;
      workspaceComponents.value.splice(componentIndex, 1);
    } else {
      // Add the component back
      workspaceComponents.value.splice(
        positionIndex,
        0,
        action.projectComponent
      );
    }
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
    return workspaceComponents.value;
  };

  const updateProjectComponentDelete = (
    action: ProjectComponentAddDeleteHistoryAction,
    undo: boolean
  ) => {
    const { workspaceComponentItemId, positionIndex } = action;
    if (undo) {
      // Add the component back
      workspaceComponents.value.splice(
        positionIndex,
        0,
        action.projectComponent
      );
    } else {
      // Delete the component
      const componentIndex = findIndex(
        workspaceComponents.value,
        "id",
        workspaceComponentItemId
      );
      if (componentIndex === null) return null;
      workspaceComponents.value.splice(componentIndex, 1);
    }
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
    return workspaceComponents.value;
  };

  const updateProjectComponentModifiyPosition = (
    action: ProjectComponentModifyPositionHistoryAction,
    undo: boolean
  ) => {
    const { workspaceComponentItemId, toIndex, positionIndex } = action;
    const componentIndex = findIndex(
      workspaceComponents.value,
      "id",
      workspaceComponentItemId
    );
    if (componentIndex === null) return null;
    const workspaceComponent = workspaceComponents.value[componentIndex];
    if (undo) {
      workspaceComponents.value.splice(toIndex, 1);
      workspaceComponents.value.splice(positionIndex, 0, workspaceComponent);
    } else {
      workspaceComponents.value.splice(positionIndex, 1);
      workspaceComponents.value.splice(toIndex, 0, workspaceComponent);
    }
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
    return workspaceComponents.value;
  };

  const updateComponent = async (
    action: ProjectComponentHistoryAction,
    undo: boolean
  ) => {
    const { type, elementId, workspaceComponentItemId, modifier } = action;
    const value = undo ? action.previousValue : action.value;

    const componentIndex = findIndex(
      workspaceComponents.value,
      "id",
      workspaceComponentItemId
    );
    if (componentIndex === null) return null;

    const workspaceComponent = workspaceComponents.value[componentIndex];
    const elementIndex = findIndex(workspaceComponent.json, "id", elementId);
    if (elementIndex === null) return null;

    const element = workspaceComponent.json[elementIndex];

    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      element.attributes.style.value[modifier] = value;
      return await updateElementFocusAndScroll(
        componentIndex,
        element,
        modifier,
        CanvasEditableTypes.STYLE
      );
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      element.attributes[modifier].value = value;
      return await updateElementFocusAndScroll(
        componentIndex,
        element,
        modifier,
        CanvasEditableTypes.ATTRIBUTE
      );
    } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
      element[modifier] = value;
      return await updateElementFocusAndScroll(
        componentIndex,
        element,
        modifier,
        CanvasEditableTypes.CONTENT
      );
    }

    return null;
  };

  const updateElementFocusAndScroll = async (
    componentIndex: number,
    element: any,
    modifier: string,
    editableType: CanvasEditableTypes
  ) => {
    const selectedElementId = element.parent ? element.parent : element.id;
    const selElementIndex = findIndex(
      workspaceComponents.value[componentIndex].json,
      "id",
      selectedElementId
    );
    if (selElementIndex === null) return null;

    if (!isElementAlreadyFocused(componentIndex, selectedElementId)) {
      await focusComponentElement(
        componentIndex,
        selElementIndex,
        FOCUS_SCROLL_TYPES.BOTH,
        editableType,
        modifier
      ).then();
    } else {
      await updateFocusedElementDomAndScroll(
        componentIndex,
        element,
        editableType,
        modifier
      );
    }

    return element;
  };

  const updateComponent2 = async (
    action: ProjectComponentHistoryAction,
    undo: boolean
  ) => {
    const { type, elementId, workspaceComponentItemId, modifier } = action;
    const value = undo ? action.previousValue : action.value;
    if (type === HistoryActionTypes.COMPONENT_STYLE) {
      const componentIndex = findIndex(
        workspaceComponents.value,
        "id",
        workspaceComponentItemId
      );
      if (componentIndex === null) return null;
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
        await focusComponentElement(
          componentIndex,
          selElementIndex,
          FOCUS_SCROLL_TYPES.BOTH,
          CanvasEditableTypes.STYLE,
          modifier
        ).then();
      } else {
        await updateFocusedElementDomAndScroll(
          componentIndex,
          element,
          CanvasEditableTypes.STYLE,
          modifier
        );
      }
      return element;
    } else if (type === HistoryActionTypes.COMPONENT_ATTRIBUTE) {
      const componentIndex = findIndex(
        workspaceComponents.value,
        "id",
        workspaceComponentItemId
      );
      if (componentIndex === null) return null;
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
        await focusComponentElement(
          componentIndex,
          selElementIndex,
          FOCUS_SCROLL_TYPES.BOTH,
          CanvasEditableTypes.ATTRIBUTE,
          modifier
        ).then();
      } else {
        await updateFocusedElementDomAndScroll(
          componentIndex,
          element,
          CanvasEditableTypes.ATTRIBUTE,
          modifier
        );
      }
      return element;
    } else if (type === HistoryActionTypes.COMPONENT_CONTENT) {
      const componentIndex = findIndex(
        workspaceComponents.value,
        "id",
        workspaceComponentItemId
      );
      if (componentIndex === null) return null;
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
        await focusComponentElement(
          componentIndex,
          selElementIndex,
          FOCUS_SCROLL_TYPES.BOTH,
          CanvasEditableTypes.CONTENT
        ).then();
      } else {
        await updateFocusedElementDomAndScroll(
          componentIndex,
          element,
          CanvasEditableTypes.CONTENT
        );
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
    undoStack,
    updateHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
