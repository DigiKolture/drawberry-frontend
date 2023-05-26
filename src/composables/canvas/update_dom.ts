import * as cheerio from "cheerio";

export function updateDom() {
  const attributesSettings: any = {
    td: ["bgcolor", "valign", "align", "background", "height"],
    img: ["src"],
    a: ["href"],
  };
  const updateElementDom = (html: string, elementJson: any, here = false) => {
    const $ = cheerio.load(html);
    const el = $(`#${elementJson.id}`);
    let tagName = el.prop("tagName");
    tagName = tagName.toLowerCase();
    const elementAttributes = el.attr();
    const attributesValues = attributesSettings[tagName];

    if (elementAttributes) {
      for (const attribute of attributesValues) {
        if (!Object.keys(elementAttributes).includes(attribute)) {
          continue;
        }
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
    }

    //UPDATE Content
    if (elementJson.innerHtml !== null && elementJson.innerHtml !== "") {
      el.text(elementJson.innerHtml);
    }

    return $.html();
  };

  return {
    updateElementDom,
  };
}
