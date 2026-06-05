import { computed } from "vue";
import store from "@/store";
import { arrange } from "@/composables/canvas/elements/arrange";
import { helpers } from "@/composables/helpers";
import { history } from "@/composables/canvas/history";
const { arrangeElementsInComponentHTML } = arrange();
const { copyObject, find } = helpers();
const { getParentChildrenElements } = focus();
const { updateHistory } = history();
import * as cheerio from "cheerio";

const { findIndex } = helpers();
import {
  HistoryActionTypes,
  ProjectComponentElementDuplicateHistoryAction,
} from "@/store/modules/history/types";
import { focus } from "@/composables/canvas/focus";

export function duplicateElements() {
  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
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

  const getBlockParent = (json: any[], blockId: string): string => {
    const block = json.find((el: any) => el.id === blockId);
    if (block.parent == null) return blockId;
    return block.parent;
  };

  const getParentBlock = (json: any[], parentId: string): string => {
    const parent = json.find((el: any) => el.id === parentId);
    if (parent.blockId == null) return parentId;
    return parent.blockId;
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
    wrapperId: string,
    focusedChildrenElements: any[] = [],
    duplicatedElementStartIndex = 0
  ): any => {
    const jsonIndex = componentItem.json.findIndex(
      (item: any) => item.id === elementId
    );

    if (jsonIndex === -1) return null;

    const jsonElement = copyObject(componentItem.json[jsonIndex]);

    const duplicateId = (id: string, suffix: string) => {
      // Strip any existing duplicate suffix before adding the new one
      const baseId = id.split("_dup_")[0];
      return `${baseId}_dup_${suffix}`;
    };

    const duplicatedElement = {
      ...jsonElement,
      id: duplicateId(jsonElement.id, randomSuffix),
    };

    //Update the wrapperId only if it's not null, we only set wrapperId for the block element
    if (jsonElement.wrapperId !== null) {
      duplicatedElement.wrapperId = wrapperId;
    }

    //Update the blockId only if it's not null, we only set blockId for block children, so if there is a blockId, we need to update it
    if (jsonElement.blockId !== null) {
      duplicatedElement.blockId = duplicateId(
        jsonElement.blockId,
        randomSuffix
      );
    }

    const children: any[] = [];

    // Insert the duplicated parent element
    componentItem.json.splice(
      duplicatedElementStartIndex,
      0,
      duplicatedElement
    );

    // Recursively duplicate children elements
    const duplicateChildrenRecursively = (
      parentId: string,
      newParentId: string,
      startIndex: number,
      collectChildren = false
    ) => {
      const childElements = componentItem.json
        .filter(
          (item: any) =>
            item.blockId === parentId || item.wrapperId === parentId
        )
        .reverse();

      for (const childElement of childElements) {
        const childIndex = componentItem.json.findIndex(
          (item: any) => item.id === childElement.id
        );
        if (childIndex === -1) continue;

        const duplicatedChildElement = {
          ...copyObject(childElement),
          id: duplicateId(childElement.id, randomSuffix),
          parent: childElement.parent
            ? duplicateId(childElement.parent, randomSuffix)
            : null,
        };

        if (childElement.wrapperId !== null) {
          duplicatedChildElement.wrapperId =
            childElement.wrapperId === parentId
              ? newParentId
              : duplicateId(childElement.wrapperId, randomSuffix);
        }
        if (childElement.blockId !== null) {
          duplicatedChildElement.blockId =
            childElement.blockId === parentId
              ? newParentId
              : duplicateId(childElement.blockId, randomSuffix);
        }

        if (childElement.children && childElement.children.length > 0) {
          duplicatedChildElement.children = childElement.children.map(
            (id: string) => duplicateId(id, randomSuffix)
          );
        }

        componentItem.json.splice(startIndex, 0, duplicatedChildElement);
        if (collectChildren) {
          children.push(duplicatedChildElement.id);
        }

        // Recurse for this child's children
        duplicateChildrenRecursively(
          childElement.id,
          duplicatedChildElement.id,
          startIndex + 1,
          false
        );
      }
    };

    duplicateChildrenRecursively(
      elementId,
      duplicatedElement.id,
      duplicatedElementStartIndex + 1,
      true
    );

    duplicatedElement.children = children;

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
    const suffix = duplicatedElementId.split("_dup_").pop();
    if (!suffix) return false;

    const suffixPattern = `_dup_${suffix}`;
    const before = componentItem.json.length;
    componentItem.json = componentItem.json.filter(
      (item: any) => !item.id.endsWith(suffixPattern)
    );
    return componentItem.json.length < before;
  };

  // Core reusable function to update component HTML and store
  const getJsonOrderFromHtml = (html: string): string[] => {
    const $ = cheerio.load(html);
    const rootComponent = $("[component]").first();
    if (rootComponent.length === 0) return [];

    const orderedIds: string[] = [];

    const traverse = (element: any) => {
      element.children().each((_: any, child: any) => {
        const $child = $(child);
        const childId = $child.attr("id");
        if (childId) {
          orderedIds.push(childId);
        }
        traverse($child);
      });
    };

    traverse(rootComponent);
    return orderedIds;
  };

  const reorderJsonByHtml = (componentItem: any) => {
    const orderedIds = getJsonOrderFromHtml(componentItem.html);
    if (orderedIds.length === 0) return;

    const elementById = new Map(
      componentItem.json.map((el: any) => [el.id, el])
    );
    const orderedJson: any[] = [];

    for (const id of orderedIds) {
      const element = elementById.get(id);
      if (element) {
        orderedJson.push(element);
        elementById.delete(id);
      }
    }

    for (const element of componentItem.json) {
      if (elementById.has(element.id)) {
        orderedJson.push(element);
        elementById.delete(element.id);
      }
    }

    componentItem.json = orderedJson;
  };

  const updateComponentAndStore = (componentItem: any) => {
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.html,
      componentItem.json
    );
    reorderJsonByHtml(componentItem);
    store.commit("canvas/SET_WORKSPACE_COMPONENTS", workspaceComponents.value);
  };

  const getBlockIdsAtSameDepth = (id: string, html: string) => {
    const $ = cheerio.load(html);
    const el = $(`#${id}`);

    // Check if element exists
    if (el.length === 0) {
      console.log(`Element with id "${id}" not found in HTML`);
      return [];
    }

    const blockIds: string[] = [];

    // Get only direct children with block attribute
    el.children("[block][id]").each((i, element) => {
      const blockId = $(element).attr("id");
      if (blockId) {
        blockIds.push(blockId);
      }
    });

    return blockIds;
  };

  const getBlockIds = (id: string, html: string) => {
    const $ = cheerio.load(html);
    const el = $(`#${id}`);

    // Check if element exists
    if (el.length === 0) {
      console.log(`Element with id "${id}" not found in HTML`);
      return [id]; // Return original ID if not found
    }

    const blockIds: string[] = [];

    // If the main element itself has a block attribute, treat it as the top-level block only.
    if (el.attr("block") !== undefined) {
      blockIds.push(id);
      return blockIds;
    }

    // Otherwise, collect only direct child blocks (not nested descendant blocks).
    el.children("[block][id]").each((i, element) => {
      const blockId = $(element).attr("id");
      if (blockId) {
        blockIds.push(blockId);
      }
    });

    return blockIds;
  };

  const getLastIndexForParentAndChildElements = (
    jsonArray: any[],
    id: string
  ) => {
    let idIndex = -1;
    let parentIndex = -1;

    for (let i = 0; i < jsonArray.length; i++) {
      if (jsonArray[i].id === id) {
        idIndex = i;
      }
      if (jsonArray[i].parent === id) {
        parentIndex = i;
      }
    }

    return Math.max(idIndex, parentIndex);
  };

  const duplicateItem = (itemIndex: number, focusedElementId: string) => {
    const componentItem = workspaceComponents.value[itemIndex];
    // Clone the json array to prevent affecting defaultJson
    componentItem.json = structuredClone(componentItem.json);

    // Get the actual element
    const focusedElement = componentItem.json.find(
      (el: any) => el.id === focusedElementId
    );
    if (!focusedElement) return;

    // If the selected element is not a block itself, but has a blockId (is a child of a block),
    // we should duplicate the block instead
    let elementToDuplicate = focusedElementId;
    const isBlock =
      focusedElement.blockId === null && focusedElement.wrapperId !== null;

    if (!isBlock && focusedElement.blockId !== null) {
      // This is a child element inside a block, so duplicate the block instead
      elementToDuplicate = focusedElement.blockId;
    }

    // For child elements inside blocks, directly use the block as the target
    // without calling getParentBlock, as it may follow parent attributes incorrectly
    let parentBlockId: string;
    if (elementToDuplicate !== focusedElementId) {
      // Direct block duplication path for child elements
      const randomSuffix = getRandomSuffix();
      const blockElement = componentItem.json.find(
        (el: any) => el.id === elementToDuplicate
      );

      if (!blockElement) return;

      const blockWrapperIndex = getLastIndexForParentAndChildElements(
        componentItem.json,
        blockElement.id
      );

      duplicateElementWithChildren(
        componentItem,
        blockElement.id,
        randomSuffix,
        blockElement.wrapperId,
        [],
        blockWrapperIndex + 1
      );

      updateComponentAndStore(componentItem);
      return;
    } else {
      parentBlockId = getParentBlock(componentItem.json, elementToDuplicate);
    }

    // console.log({ focusedElementId, parentBlockId });

    const blockIds = getBlockIds(parentBlockId, componentItem.html);

    if (blockIds.length === 0) {
      return;
    }

    const getLastParentId = getBlockParent(
      componentItem.json,
      blockIds[blockIds.length - 1]
    );

    let lastIndex = getLastIndexForParentAndChildElements(
      componentItem.json,
      getLastParentId
    );

    // console.log({ blockIds });

    const blockWrappers: Record<string, string> = {};
    const randomSuffix = getRandomSuffix();
    let firstParentId: string | null = null;
    let firstDuplicatedId: string | null = null;

    const firstBlock = find(componentItem.json, "id", blockIds[0]);
    blockWrappers[blockIds[0]] = firstBlock.wrapperId;

    for (let i = 0; i < blockIds.length; i++) {
      const blockId = blockIds[i];
      const parentId = getBlockParent(componentItem.json, blockId);
      const parent = find(componentItem.json, "id", parentId);
      const parentChildrenElements = getParentChildrenElements(
        parent,
        componentItem
      );

      //Only the block has the wrapperId
      const block = find(componentItem.json, "id", blockId);

      //If it's the first block, use the same wrapperId, if its another block (which is wrapped inside the first block), then we need to use the wrapperId of the element that will be duplicated
      const wrapperId = blockWrappers[blockId];
      const { duplicatedElement } = duplicateElementWithChildren(
        componentItem,
        parentId,
        randomSuffix,
        wrapperId,
        parentChildrenElements,
        lastIndex + 1
      );

      if (i === 0) {
        firstParentId = parentId;
        firstDuplicatedId = duplicatedElement.id;
      }

      lastIndex += 1 + parentChildrenElements.length;

      const blockIdsAtSameDepth = getBlockIdsAtSameDepth(
        blockId,
        componentItem.html
      );

      for (const blockIdAtSameDepth of blockIdsAtSameDepth) {
        blockWrappers[blockIdAtSameDepth] = duplicatedElement.id;
      }
    }

    updateHistory({
      type: HistoryActionTypes.PROJECT_COMPONENT_ELEMENT_DUPLICATE,
      projectComponent: componentItem,
      workspaceComponentItemId: componentItem.id,
      elementId: firstParentId!,
      duplicatedElementId: firstDuplicatedId!,
    });

    updateComponentAndStore(componentItem);
    // return result;
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

      //TODO: Fix start index in ftn
      const result = duplicateElementWithChildren(
        componentItem,
        elementId,
        randomSuffix,
        originalElement.wrapperId,
        childrenElements
      );

      if (!result) return null;
    }

    updateComponentAndStore(componentItem);
    return workspaceComponents.value;
  };

  return {
    getRowId,
    getBlockParent,
    getParentBlock,
    duplicateItem,
    getUpdatedHTMLForRow,
    transformHtmlWithDuplicates,
    updateProjectComponentDuplicate,
  };
}
