import * as cheerio from "cheerio";

export function updateDom() {
  const attributesSettings: any = {
    td: ["valign", "align", "background", "height"],
    img: ["src"],
    a: ["href"],
  };

  const updateComponentItemDom = (componentItem: any) => {
    let html = componentItem.html;
    const json = componentItem.json;

    for (const elementJson of json) {
      if (!elementJson.attributes.style.value) continue;
      html = updateElementDom(html, elementJson);
    }
    componentItem.html = html;
    return componentItem;
  };

  const isChild = (element: any) => {
    //If parent ID is null, then its a child
    return element.parent !== null;
  };

  const updateElementDom = (html: string, elementJson: any, here = false) => {
    const $ = cheerio.load(html);
    const el = $(`#${elementJson.id}`);
    let tagName = el.prop("tagName");
    tagName = tagName.toLowerCase();
    const elementAttributes = el.attr();
    const attributesValues = attributesSettings[tagName];
    const attributes = elementJson.attributes;

    if (elementAttributes && attributesValues) {
      for (const attribute of attributesValues) {
        if (!Object.keys(elementAttributes).includes(attribute)) {
          continue;
        }

        //TODO: This scenario works when you might have a background-color style but not bg-color even if it might be required for the element
        // if (!elementJson.attributes[attribute]) {
        //   continue;
        // }
        el.attr(attribute, elementJson.attributes[attribute].value);
      }
    }

    const style: Record<string, any> = elementJson.attributes.style.value;
    if (style) {
      for (const [key, value] of Object.entries(style)) {
        style[key] = value;
        // if (typeof value !== "string" && key === "font-size") {
        //   style[key] = value.unit ? `${value.value}${value.unit}` : value.value;
        // } else if (typeof value === "object") {
        //   style[key] = value.value;
        // } else {
        //   style[key] = value;
        // }
      }
    }

    if (style && style["background-color"]) {
      el.attr("bgcolor", style["background-color"]);
    }
    if (
      attributes &&
      attributes["background"] &&
      attributes["background"].value
    ) {
      style["background-image"] = `url(${attributes["background"].value})`;
    }

    el.css(style);
    if (typeof elementJson.classes == "object") {
      const classAttribute = el.attr("class");
      const classList = classAttribute ? classAttribute.split(" ") : [];
      const newClasses = elementJson.classes;

      el.attr("class", elementJson.classes.join(" "));

      if (classList.includes("hover") && !newClasses.includes("hover")) {
        classList.splice(classList.indexOf("hover"), 1);
      }
      if (classList.includes("focus") && !newClasses.includes("focus")) {
        classList.splice(classList.indexOf("focus"), 1);
      }
      const mergedClasses = Array.from(new Set(classList.concat(newClasses)));
      el.addClass(mergedClasses.join(" "));

      // Add class parent if the parent field is true
      if (elementJson.parent) {
        el.addClass("parent");
      }
    }

    // Add link URL to image anchor tag
    // if (tagName === "img" && tagTypes.includes("link")) {
    //   el.parent().attr("href", elementJson.attributes["href"].value);
    // }

    //UPDATE Content
    // TODO: Update Condition
    if (
      elementJson.innerHtml !== null &&
      elementJson.innerHtml !== "" &&
      elementJson.innerHtml.trim()
    ) {
      el.text(elementJson.innerHtml);
    }

    return $.html();
  };

  return {
    updateElementDom,
    isChild,
    updateComponentItemDom,
  };
}
