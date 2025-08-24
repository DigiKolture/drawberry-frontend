import * as cheerio from "cheerio";
import { updateDom } from "@/composables/canvas/update_dom";
const { updateElementDom } = updateDom();

export function arrange() {
  const getFirstWrapperId = (ids: string[], json: any) => {
    for (const item of json) {
      if (ids.includes(item.id) && item.wrapperId) {
        return item.wrapperId;
      }
    }
    //TODO: Return the first element's wrapperId if no wrapperId is found
    return null;
  };

  const updateIdsAndParents = (htmlString: string, suffix: string): string => {
    return htmlString.replace(
      /(id|parent)="([^"]+?)"/g,
      (match, attr, value) => {
        const newValue = value.replace(/_dup_[a-zA-Z0-9]+$/, "");
        return `${attr}="${newValue}_dup_${suffix}"`;
      }
    );
  };
  const getHTMLOfParentAndChildren = (
    htmlString: string,
    parentId: string,
    childrenIds: string[]
  ): string => {
    if (parentId.includes("_dup_")) {
      const sourceSplit = parentId.split("_dup_");
      const sourceId = sourceSplit[0];
      const suffix = sourceSplit[sourceSplit.length - 1];
      const sourceChildrenIds = childrenIds.map((id) => id.split("_dup_")[0]);

      // console.log({ sourceId, sourceChildrenIds });

      const sourceWrapperHTML = getHTMLOfParentAndChildren(
        htmlString,
        sourceId,
        sourceChildrenIds
      );

      // console.log("Source Wrapper HTML:", sourceWrapperHTML);

      return updateIdsAndParents(sourceWrapperHTML, suffix);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const allIds = [parentId, ...childrenIds];
    const elements = allIds
      .map((id) => doc.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return "";

    // Try to find the outermost common ancestor that contains all elements
    const getCommonAncestor = (els: HTMLElement[]): HTMLElement | null => {
      if (els.length === 1) return els[0];

      let current: HTMLElement | null = els[0];
      while (current) {
        if (els.every((el) => current!.contains(el))) return current;
        current = current.parentElement;
      }
      return null;
    };

    const commonAncestor = getCommonAncestor(elements);
    return commonAncestor
      ? commonAncestor.outerHTML
      : elements.map((el) => el.outerHTML).join("\n");
  };

  const getParentElements = (htmlString: any, jsonData: any[]) => {
    const parents: any = [];

    for (const element of jsonData) {
      if (element.parent === null) {
        parents.push({
          id: element.id,
          children: element.children,
          html: getHTMLOfParentAndChildren(
            htmlString,
            element.id,
            element.children
          ),
          wrapperId: getFirstWrapperId(
            [element.id, ...element.children],
            jsonData
          ),
        });
      }
    }

    return parents;
  };

  const arrangeElementsInComponentHTML = (
    htmlString: any,
    jsonData: any,
    updateStyle = true
  ) => {
    const newJson = [...jsonData];

    //Remove the first element which is the component item itself
    newJson.shift();

    const parents = getParentElements(htmlString, newJson);
    let html = updateHTML(htmlString, parents);

    if (updateStyle) {
      for (const elementJson of jsonData) {
        // if (!elementJson.attributes.style.value) continue;
        html = updateElementDom(html, elementJson);
      }
    }

    return html;
  };

  const updateHTML = (htmlString: string, parents: any[]): string => {
    const $ = cheerio.load(htmlString);

    //Remove all elements with the block attribute
    $("[block]").each((_, el) => {
      const $el = $(el);
      $el.remove();
    });

    //Add all parent elements to their respective wrappers in the order of the json
    for (const parent of parents) {
      const wrapper = $(`#${parent.wrapperId}`);
      if (wrapper.length > 0) {
        wrapper.append(parent.html);
      }
    }

    return $.html();
  };

  return {
    arrangeElementsInComponentHTML,
  };
}
