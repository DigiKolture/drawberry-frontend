import * as cheerio from "cheerio";
import { updateDom } from "@/composables/canvas/update_dom";

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

  const isDescendantOf = (node: any, ancestor: any): boolean => {
    let current = node.parent;
    while (current) {
      if (current === ancestor) return true;
      current = current.parent;
    }
    return false;
  };

  /**
   * Duplicated elements live in the json but never in the html — duplicate.ts is a
   * pure-json operation and leaves it to arrange to materialise them. Clone the source
   * subtree as a unit rather than per-element, so non-editable wrappers nested inside a
   * duplicated block are carried into the copy.
   */
  const synthesizeDuplicates = ($: any, json: any[]): void => {
    const missing = json.filter(
      (el) => getDuplicateInfo(el.id) && $(`#${el.id}`).length === 0
    );
    if (missing.length === 0) return;

    const cloneSubtreeAfterSource = (sourceNode: any, suffix: string) => {
      const $clone = $(sourceNode).clone();

      const suffixNode = ($node: any) => {
        const id = $node.attr("id");
        if (id) $node.attr("id", applyDupSuffix(id, suffix));

        const parent = $node.attr("parent");
        if (parent) $node.attr("parent", applyDupSuffix(parent, suffix));
      };

      suffixNode($clone);
      $clone
        .find("[id], [parent]")
        .each((_: any, el: any) => suffixNode($(el)));

      $(sourceNode).after($clone);
    };

    const sourceIdsBySuffix = new Map<string, Set<string>>();
    for (const el of missing) {
      const { sourceId, suffix } = getDuplicateInfo(el.id) as any;
      if (!sourceIdsBySuffix.has(suffix)) {
        sourceIdsBySuffix.set(suffix, new Set());
      }
      sourceIdsBySuffix.get(suffix)?.add(sourceId);
    }

    for (const [suffix, sourceIds] of sourceIdsBySuffix) {
      const sourceNodes = Array.from(sourceIds)
        .map((id) => $(`#${id}`)[0])
        .filter(Boolean);

      // A single duplicate operation shares one suffix across the whole subtree it
      // copies, so cloning the outermost sources also covers the nested ones.
      const outermost = sourceNodes.filter(
        (node) =>
          !sourceNodes.some(
            (other) => other !== node && isDescendantOf(node, other)
          )
      );

      for (const node of outermost) {
        cloneSubtreeAfterSource(node, suffix);
      }
    }
  };

  /**
   * Drop editable elements the json no longer carries (a duplicate that was undone).
   * Non-editable nodes are never in the json, so they must never be pruned.
   */
  const pruneRemovedElements = (
    $: any,
    rootComponent: any,
    jsonIds: Set<string>
  ): void => {
    const removed: any[] = [];

    rootComponent.find(".editable[id]").each((_: any, el: any) => {
      const id = $(el).attr("id");
      if (id && !jsonIds.has(id)) removed.push(el);
    });

    for (const el of removed) $(el).remove();
  };

  /**
   * Sort each parent's json-backed children into json order, writing them back into the
   * slots they already occupied. Appending them instead would shunt every non-editable
   * sibling to the front of the parent.
   */
  const reorderToJsonOrder = (
    rootComponent: any,
    jsonIndex: Map<string, number>
  ): void => {
    const parents = [rootComponent[0], ...rootComponent.find("*").toArray()];

    for (const parent of parents) {
      const contents = parent.children || [];

      const slots: number[] = [];
      const nodes: any[] = [];

      contents.forEach((node: any, index: number) => {
        const id = node.attribs?.id;
        if (id && jsonIndex.has(id)) {
          slots.push(index);
          nodes.push(node);
        }
      });

      if (nodes.length < 2) continue;

      const sorted = [...nodes].sort(
        (a, b) =>
          (jsonIndex.get(a.attribs.id) as number) -
          (jsonIndex.get(b.attribs.id) as number)
      );

      if (sorted.every((node, index) => node === nodes[index])) continue;

      const reordered = [...contents];
      slots.forEach((slot, index) => {
        reordered[slot] = sorted[index];
      });

      reordered.forEach((node: any, index: number) => {
        node.parent = parent;
        node.prev = reordered[index - 1] || null;
        node.next = reordered[index + 1] || null;
      });

      parent.children = reordered;
    }
  };

  /**
   * Rebuilds a component's html from its pristine markup plus the json.
   *
   * `html` must be the pristine component markup (componentItem.defaultHtml), never a
   * previously arranged string — that keeps this a pure function of (html, json) and
   * stops each breakpoint switch from re-arranging its own output.
   */
  const arrangeElementsInComponentHTML = (
    html: string,
    json: any[],
    updateStyle = true
  ): string => {
    if (!html) return html;

    const $ = cheerio.load(html);

    const rootComponent = $("[component]");
    if (rootComponent.length === 0) return html;
    if (rootComponent.children().length === 0) return html;

    const jsonIds = new Set<string>(json.map((el) => el.id));
    const jsonIndex = new Map<string, number>(
      json.map((el, index) => [el.id, index])
    );

    synthesizeDuplicates($, json);
    pruneRemovedElements($, rootComponent, jsonIds);
    reorderToJsonOrder(rootComponent, jsonIndex);

    let resultHtml = $.html();

    if (updateStyle) {
      // Resolved here rather than at module scope: update_dom imports this module back,
      // and a top-level call on either side breaks whichever loads second.
      const { updateElementDom } = updateDom();

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
