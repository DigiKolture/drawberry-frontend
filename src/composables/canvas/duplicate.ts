import { computed } from "vue";
import store from "@/store";
import { arrange } from "@/composables/canvas/elements/arrange";
import { helpers } from "@/composables/helpers";
const { arrangeElementsInComponentHTML } = arrange();
const { copyObject } = helpers();

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

  const duplicateItem = (itemIndex: number, focusedElementId: string) => {
    const componentItem = workspaceComponents.value[itemIndex];
    // Clone the json array to prevent affecting defaultJson
    componentItem.json = structuredClone(componentItem.json);

    let jsonIndex = componentItem.json.findIndex(
      (item: any) => item.id === focusedElementId
    );

    const jsonElement = copyObject(componentItem.json[jsonIndex]);
    const wrapperId = jsonElement.wrapperId;

    const randomSuffix = getRandomSuffix();

    const duplicatedElement = {
      ...jsonElement,
      id: duplicateId(jsonElement.id, randomSuffix),
    };

    const copyJsonIndex = jsonIndex + 1;
    const children = [];
    for (const focusedChildrenElementRaw of focusedChildrenElements.value) {
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

    componentItem.json.splice(copyJsonIndex, 0, {
      ...duplicatedElement,
      children,
    });

    const htmlString = componentItem.html;
    const rowIndexOfOriginalElement = componentItem.json
      .filter(
        (item: any) =>
          item.id && item.parent == null && item.wrapperId == wrapperId
      )
      .findIndex((item: any) => item.id === jsonElement.id);

    const rowChildren = getAllChildrenById(htmlString, wrapperId);
    // const childHTML = rowChildren[rowIndexOfOriginalElement];

    // console.log(rowChildren);

    // const newHTML = updateIdsAndParents(childHTML, randomSuffix);
    // rowChildren.splice(rowIndexOfOriginalElement + 1, 0, newHTML);
    // htmlString = replaceChildrenById(rowId, htmlString, rowChildren);
    componentItem.html = arrangeElementsInComponentHTML(
      componentItem.html,
      componentItem.json
    );
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

  return {
    getRowId,
    duplicateItem,
    getUpdatedHTMLForRow,
    transformHtmlWithDuplicates,
  };
}
