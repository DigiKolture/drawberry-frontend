import { computed } from "vue";
import store from "@/store";
import { arrange } from "@/composables/canvas/elements/arrange";
import { helpers } from "@/composables/helpers";
import { history } from "@/composables/canvas/history";
const { arrangeElementsInComponentHTML } = arrange();
const { copyObject } = helpers();
const { updateHistory } = history();
const { findIndex } = helpers();
import {
  ProjectComponentElementDuplicateHistoryAction,
  HistoryActionTypes,
} from "@/store/modules/history/types";

export function duplicateElements() {
  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const focusedChildrenElements = computed(() => {
    return store.getters["canvas/focusedChildrenElements"];
  });

  const deepClone = <T>(obj: T): T => {
    if (typeof structuredClone !== "undefined") {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  };

  const getRandomSuffix = () => {
    return Math.random().toString(36).substring(2, 6);
  };

  const duplicateId = (elementId: string, randomSuffix: string) => {
    //In case the elementId already has a duplicate suffix, we need to remove it first. So we are using the original elementId
    const splitElement = elementId.split("_dup_")[0];
    return `${splitElement}_dup_${randomSuffix}`;
  };

  const extractSuffix = (elementId: string) => {
    const splitElement = elementId.split("_dup_");
    return splitElement[1];
  };

  const getRowId = (element: any) => {
    let current = element;

    while (current && current.parentElement.hasAttribute("parent")) {
      current = current.parentElement;
    }
    const isARow = current.parentElement.classList.contains("row");
    return isARow ? current.parentElement.id : null;
  };

  const getAllChildrenById = (htmlString: string, id: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const parentEl = doc.getElementById(id);
    if (parentEl) {
      return Array.from(parentEl.children).map((child) => child.outerHTML);
    }
    return [];
  };

  const startsWithAny = (str: string, arr: string[]) => {
    return arr.some((prefix) => str.startsWith(prefix));
  };

  const getUniqueIdAndParentAttributes = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const elements = doc.body.querySelectorAll("[id], [parent]");

    const values = new Set();

    elements.forEach((el) => {
      if (el.hasAttribute("id")) {
        values.add(el.getAttribute("id"));
      }
      if (el.hasAttribute("parent")) {
        values.add(el.getAttribute("parent"));
      }
    });

    return Array.from(values);
  };

  const updateIdsAndParents = (htmlString: string, suffix: string) => {
    return htmlString.replace(
      /(id|parent)="([^"]+?)"/g,
      (match, attr, value) => {
        const newValue = value.replace(/_dup_[a-zA-Z0-9]+$/, "");
        return `${attr}="${newValue}_dup_${suffix}"`;
      }
    );
  };

  const replaceChildrenById = (
    targetId: string,
    htmlString: string,
    newChildren: any[]
  ) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const target = doc.getElementById(targetId);
    if (!target) return htmlString; // ID not found

    // Remove all current children
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }

    // Append new children
    newChildren.forEach((childHtml) => {
      const tempDiv = doc.createElement("div");
      tempDiv.innerHTML = childHtml;

      // Move the actual child node(s) from the temp container
      Array.from(tempDiv.childNodes).forEach((node) => {
        target.appendChild(node);
      });
    });

    return doc.body.innerHTML;
  };

  const getUpdatedHTMLForRow = (
    rowId: string,
    htmlString: any,
    jsonData: any
  ) => {
    // Get duplicated parent elements for the row, with the position index of each duplicated parent element
    const duplicatedParentElements = jsonData
      .filter(
        (item: any) => item.id && item.parent == null && item.rowId == rowId
      )
      .map((item: any, index: number) => {
        return { index, id: item.id };
      })
      .filter((item: any) => item.id && item.id.includes("_dup_"));

    // Get all the children item of the row
    const children = getAllChildrenById(htmlString, rowId);

    const copiedChildren = [...children];

    for (const duplicatedParentElement of duplicatedParentElements) {
      const duplicatedElementId = duplicatedParentElement.id;
      const duplicatedElementIndex = duplicatedParentElement.index;

      const duplicatedElementIdArr = duplicatedElementId.split("_");
      const suffix = duplicatedElementIdArr[duplicatedElementIdArr.length - 1];

      for (const childHTML of children) {
        // Check if the child HTML starts with the duplicated element ID
        const IDS = getUniqueIdAndParentAttributes(childHTML) as string[];
        const startWith = startsWithAny(duplicatedElementId, IDS);

        if (startWith) {
          // If it starts with the duplicated element ID, we need create the HTML from that and update the IDs and parents IDs
          const newHTML = updateIdsAndParents(childHTML, suffix);
          copiedChildren.splice(duplicatedElementIndex, 0, newHTML);
          break;
        }
      }
    }

    htmlString = replaceChildrenById(rowId, htmlString, copiedChildren);

    return htmlString;
  };

  const duplicateElementWithChildren = (
    componentItem: any,
    elementId: string,
    randomSuffix: string,
    focusedChildrenElements: any[] = []
  ) => {
    let jsonIndex = componentItem.json.findIndex(
      (item: any) => item.id === elementId
    );

    if (jsonIndex === -1) return null;

    const jsonElement = copyObject(componentItem.json[jsonIndex]);

    const duplicatedElement = {
      ...jsonElement,
      id: duplicateId(jsonElement.id, randomSuffix),
    };

    const copyJsonIndex = jsonIndex + 1;
    const children = [];

    // Duplicate children elements
    for (const focusedChildrenElementRaw of focusedChildrenElements) {
      const focusedChildrenElement = copyObject(focusedChildrenElementRaw);

      jsonIndex++;
      const duplicatedChildElement = {
        ...focusedChildrenElement,
        id: duplicateId(focusedChildrenElement.id, randomSuffix),
        parent: duplicatedElement.id,
      };

      componentItem.json.splice(jsonIndex, 0, duplicatedChildElement);
      children.push(duplicatedChildElement.id);
    }

    // Insert the duplicated parent element
    componentItem.json.splice(copyJsonIndex, 0, {
      ...duplicatedElement,
      children,
    });

    return {
      duplicatedElement,
      children,
      originalElementId: elementId,
    };
  };

  const removeDuplicatedElement = (
    componentItem: any,
    duplicatedElementId: string
  ) => {
    // Find and remove all children of the duplicated element first
    const duplicatedElement = componentItem.json.find(
      (item: any) => item.id === duplicatedElementId
    );

    if (duplicatedElement && duplicatedElement.children) {
      // Remove children in reverse order to maintain indices
      for (let i = duplicatedElement.children.length - 1; i >= 0; i--) {
        const childId = duplicatedElement.children[i];
        const childIndex = componentItem.json.findIndex(
          (item: any) => item.id === childId
        );
        if (childIndex !== -1) {
          componentItem.json.splice(childIndex, 1);
        }
      }
    }

    // Remove the duplicated element itself
    const duplicatedElementIndex = componentItem.json.findIndex(
      (item: any) => item.id === duplicatedElementId
    );
    if (duplicatedElementIndex !== -1) {
      componentItem.json.splice(duplicatedElementIndex, 1);
      return true;
    }
    return false;
  };

  // Core reusable function to update component HTML and store
  const updateComponentAndStore = (componentItem: any) => {
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.html,
      componentItem.json
    );
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
  };

  const duplicateItem = (itemIndex: number, focusedElementId: string) => {
    const componentItem = workspaceComponents.value[itemIndex];
    // Clone the json array to prevent affecting defaultJson
    componentItem.json = structuredClone(componentItem.json);

    const randomSuffix = getRandomSuffix();

    const result = duplicateElementWithChildren(
      componentItem,
      focusedElementId,
      randomSuffix,
      focusedChildrenElements.value
    );

    if (!result) return null;

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_ELEMENT_DUPLICATE,
      projectComponent: componentItem,
      workspaceComponentItemId: componentItem.id,
      elementId: result.originalElementId,
      duplicatedElementId: result.duplicatedElement.id,
    });

    updateComponentAndStore(componentItem);
    return result;
  };

  const transformHtmlWithDuplicates = (htmlString: any, jsonData: any) => {
    const uniqueRowIds = [
      ...new Set(
        jsonData
          .map((item: any) => item.rowId)
          .filter((rowId: any) => rowId !== null && rowId !== undefined)
      ),
    ] as string[];

    for (const rowId of uniqueRowIds) {
      htmlString = getUpdatedHTMLForRow(rowId, htmlString, jsonData);
    }

    return htmlString;
  };

  // Undo/Redo function - now using reusable logic
  const updateProjectComponentDuplicate = (
    action: ProjectComponentElementDuplicateHistoryAction,
    undo: boolean
  ) => {
    const { workspaceComponentItemId, elementId, duplicatedElementId } = action;

    // Find the component in workspace
    const componentIndex = findIndex(
      workspaceComponents.value,
      "id",
      workspaceComponentItemId
    );
    if (componentIndex === null) return null;

    const componentItem = workspaceComponents.value[componentIndex];

    if (undo) {
      // Remove the duplicated element and its children
      const removed = removeDuplicatedElement(
        componentItem,
        duplicatedElementId
      );
      if (!removed) return null;
    } else {
      // Redo: Re-duplicate the element
      const randomSuffix = extractSuffix(duplicatedElementId);

      // Find children that need to be duplicated for redo
      const originalElement = componentItem.json.find(
        (item: any) => item.id === elementId
      );

      const childrenElements = [];
      if (originalElement && originalElement.children) {
        for (const childId of originalElement.children) {
          const childElement = componentItem.json.find(
            (item: any) => item.id === childId
          );
          if (childElement) {
            childrenElements.push(childElement);
          }
        }
      }

      const result = duplicateElementWithChildren(
        componentItem,
        elementId,
        randomSuffix,
        childrenElements
      );

      if (!result) return null;
    }

    updateComponentAndStore(componentItem);
    return workspaceComponents.value;
  };

  return {
    getRowId,
    duplicateItem,
    getUpdatedHTMLForRow,
    transformHtmlWithDuplicates,
    updateProjectComponentDuplicate,
  };
}
