import * as cheerio from "cheerio";

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
  const getHTMLOfParentAndChildren = (
    htmlString: string,
    parentId: string,
    childrenIds: string[]
  ) => {
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

  const arrangeElementsInComponentHTML = (htmlString: any, jsonData: any) => {
    const newJson = [...jsonData];

    //Remove the first element which is the component item itself
    newJson.shift();

    const parents = getParentElements(htmlString, newJson);

    console.log(parents);
    return updateHTML(htmlString, parents);
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
