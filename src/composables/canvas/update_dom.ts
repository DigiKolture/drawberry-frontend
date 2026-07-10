import * as cheerio from "cheerio";
import { helpers } from "@/composables/helpers";
import store from "@/store";
import { computed } from "vue";
import { CanvasBreakpoints } from "@/store/modules/canvas/types";
import { arrange } from "@/composables/canvas/elements/arrange";

export function updateDom() {
  const { brToNl } = helpers();

  const breakpoint = computed(() => store.getters["canvas/breakpoint"]);

  enum ProjectComponentElementsVisibilities {
    SHOW = "show",
    GHOST = "ghost", // visibility: hidden;
    NONE = "none", // display: none
  }

  const attributesSettings: any = {
    td: ["valign", "align", "background", "height"],
    img: ["src"],
    a: ["href"],
  };

  const updateComponentItemDom = (componentItem: any) => {
    // Resolved here rather than at module scope: arrange imports this module back, and a
    // top-level call on either side breaks whichever loads second.
    const { arrangeElementsInComponentHTML } = arrange();

    // Preview assigns project.components straight from the backend rather than through
    // formatProjectComponents, so its items carry no defaultHtml. Their html is pristine
    // regardless — the arranged html is never persisted. Canvas call sites pass
    // defaultHtml directly; they must never fall back to an already-arranged html.
    let html = componentItem.defaultHtml ?? componentItem.html;
    const json = componentItem.json;

    html = arrangeElementsInComponentHTML(html, json, true);
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
    if (el.length === 0) {
      console.log(`Element with id "${elementJson.id}" not found in HTML`);
      return html;
    }
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
    const flattenedStyle: Record<string, any> = {};

    if (style) {
      for (const [key, value] of Object.entries(style)) {
        const bpVal = value[breakpoint.value];
        const desktopVal = value[CanvasBreakpoints.DESKTOP];
        // Use ?? so that empty string ("") is preserved, but null/undefined
        // falls through. Convert the final null/undefined to "" so cheerio
        // removes the property from the inline style rather than leaving it.
        flattenedStyle[key] = bpVal ?? desktopVal ?? "";
      }
    }

    if (flattenedStyle && flattenedStyle["background-color"]) {
      el.attr("bgcolor", style["background-color"]);
    }
    if (
      attributes &&
      attributes["background"] &&
      attributes["background"].value
    ) {
      flattenedStyle[
        "background-image"
      ] = `url(${attributes["background"].value})`;
    }

    el.css(flattenedStyle);
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
    if (elementJson.types.includes("text")) {
      el.html(elementJson.textContent);
    }

    switch (elementJson.visibility) {
      case ProjectComponentElementsVisibilities.SHOW: {
        // Resets to default if visible
        const styleAttr = el.attr("style") || "";
        const hasDisplayNone = styleAttr.match(/display\s*:\s*none/i) !== null;
        if (hasDisplayNone) {
          el.css("display", "").css("visibility", "");
        } else {
          el.css("visibility", "");
        }
        break;
      }
      case ProjectComponentElementsVisibilities.GHOST:
        el.css("visibility", "hidden").css("display", "");
        break;
      case ProjectComponentElementsVisibilities.NONE:
        el.css("display", "none").css("visibility", "");
        break;
      default:
        break;
    }

    return $.html();
  };

  return {
    updateElementDom,
    isChild,
    updateComponentItemDom,
  };
}
