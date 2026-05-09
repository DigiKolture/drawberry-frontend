import * as cheerio from "cheerio";
import { updateDom } from "@/composables/canvas/update_dom";
const { updateElementDom } = updateDom();

export function arrange() {
  const getReorderableSiblings = (json: any[], elementId: string): any[] => {
    const element = json.find((el) => el.id === elementId);
    if (!element) return [];

    const parentId = element.blockId || element.wrapperId;

    if (!parentId) {
      return json.filter(
        (el) => !el.blockId && !el.wrapperId && el.id !== json[0].id
      );
    }

    return json.filter((el) => {
      const elParentId = el.blockId || el.wrapperId;
      return elParentId === parentId;
    });
  };

  const reorderElements = (
    json: any[],
    fromElementId: string,
    toElementId: string
  ): any[] => {
    const fromElement = json.find((el) => el.id === fromElementId);
    if (!fromElement) return json;

    const siblings = getReorderableSiblings(json, fromElementId);

    const toElement = siblings.find((el) => el.id === toElementId);
    if (!toElement) {
      console.log("Cannot drop here - not a sibling");
      return json;
    }

    const fromIndex = json.findIndex((el) => el.id === fromElementId);
    const toIndex = json.findIndex((el) => el.id === toElementId);

    const newJson = [...json];

    const [movedElement] = newJson.splice(fromIndex, 1);

    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;

    newJson.splice(adjustedToIndex, 0, movedElement);

    return newJson;
  };

  const arrangeElementsInComponentHTML = (
    html: string,
    json: any[],
    updateStyle = true
  ): string => {
    const $ = cheerio.load(html);

    // Find the root component
    const rootComponent = $("[component]");
    if (rootComponent.length === 0) return html;

    // Get the background element (first child of component)
    const backgroundElement = rootComponent.children().first();
    if (backgroundElement.length === 0) return html;

    const backgroundId = backgroundElement.attr("id");

    // Skip the first element in json, which is the background itself
    const elementsToArrange = json.slice(1);
    const getDuplicateInfo = (
      elementId: string
    ): { sourceId: string; suffix: string } | null => {
      const match = elementId.match(/^(.*)_dup_(.+)$/);
      if (!match) return null;
      return { sourceId: match[1], suffix: match[2] };
    };

    const applyDupSuffix = (value: string, suffix: string): string => {
      const base = value.replace(/_dup_[^_]+$/, "");
      return `${base}_dup_${suffix}`;
    };

    const findOriginalElement = (elementId: string): any | null => {
      const original = originalElements.get(elementId);
      if (original) {
        return original.clone();
      }

      const dupInfo = getDuplicateInfo(elementId);
      if (!dupInfo) return null;

      const sourceOriginal = findOriginalElement(dupInfo.sourceId);
      if (!sourceOriginal) return null;

      const updateNodeIds = (node: any) => {
        const id = node.attr("id");
        if (id) {
          node.attr("id", applyDupSuffix(id, dupInfo.suffix));
        }
        const parent = node.attr("parent");
        if (parent) {
          node.attr("parent", applyDupSuffix(parent, dupInfo.suffix));
        }
      };

      updateNodeIds(sourceOriginal);
      sourceOriginal.find("[id]").each((_: any, el: any) => {
        const $el = $(el);
        updateNodeIds($el);
      });

      originalElements.set(elementId, sourceOriginal.clone());
      return sourceOriginal;
    };

    const originalElements = new Map<string, any>();
    const rootId = rootComponent.attr("id");
    if (rootId) {
      originalElements.set(rootId, rootComponent.clone());
    }

    rootComponent.find("[id]").each((_, el) => {
      const $el = $(el);
      const id = $el.attr("id");
      if (id) {
        const $clone = $el.clone();
        $clone.find("[id]").not(`[id="${id}"]`).remove();
        originalElements.set(id, $clone);
      }
    });

    // Clear background content
    backgroundElement.empty();

    const pendingElements = new Map<string, any>(
      elementsToArrange.map((el) => [el.id, el])
    );
    const appendedElements = new Set<string>();

    const appendElement = (elementData: any): boolean => {
      const elementId = elementData.id;
      const parentId =
        elementData.wrapperId || elementData.blockId || backgroundId;

      const $parent =
        parentId === backgroundId ? backgroundElement : $(`#${parentId}`);
      if ($parent.length === 0) return false;

      const $original = findOriginalElement(elementId);
      if (!$original) return false;

      $parent.append($original.clone());
      appendedElements.add(elementId);
      return true;
    };

    let progress = true;
    while (pendingElements.size > 0 && progress) {
      progress = false;

      for (const [elementId, elementData] of Array.from(
        pendingElements.entries()
      )) {
        const parentId =
          elementData.wrapperId || elementData.blockId || backgroundId;

        if (parentId === backgroundId || $(`#${parentId}`).length > 0) {
          if (appendElement(elementData)) {
            pendingElements.delete(elementId);
            progress = true;
          } else {
            pendingElements.delete(elementId);
          }
        }
      }
    }

    // If some elements still couldn't resolve to an existing parent, append them to the background as fallback.
    for (const elementData of pendingElements.values()) {
      if (!appendedElements.has(elementData.id)) {
        const $original = originalElements.get(elementData.id);
        if ($original) {
          backgroundElement.append($original.clone());
          appendedElements.add(elementData.id);
        }
      }
    }

    let resultHtml = $.html();

    console.log("HTML after arranging elements:", resultHtml);

    if (updateStyle) {
      for (const elementJson of json) {
        resultHtml = updateElementDom(resultHtml, elementJson);
      }
    }

    return resultHtml;
  };

  const canDropElement = (
    json: any[],
    draggedElementId: string,
    targetElementId: string
  ): boolean => {
    const draggedSiblings = getReorderableSiblings(json, draggedElementId);

    return draggedSiblings.some((s) => s.id === targetElementId);
  };

  return {
    arrangeElementsInComponentHTML,
    reorderElements,
    canDropElement,
  };
}
