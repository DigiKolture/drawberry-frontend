import * as cheerio from "cheerio";

export function updateDom() {
  const attributesSettings: any = {
    td: ["bgcolor", "valign", "align", "background", "height"],
    img: ["src"],
    a: ["href"],
  };
  const updateElementDom = (html: string, elementJson: any) => {
    const $ = cheerio.load(html);
    const el = $(`#${elementJson.id}`);

    const tagName = el.prop("tagName").toLowerCase();
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

    el.css(style);

    return $.html();
  };

  return {
    updateElementDom,
  };
}
