import * as cheerio from "cheerio";

export function updateDom() {
  const updateElementDom = (html: string, elementJson: any) => {
    const $ = cheerio.load(html);

    const el = $(`#${elementJson.id}`);
    const style: Record<string, any> = elementJson.attributes.style.value;
    for (const [key, value] of Object.entries(style)) {
      if (typeof value !== "string") {
        style[key] = value.unit ? `${value.value}${value.unit}` : value.value;
      } else {
        style[key] = value;
      }
    }
    el.css(style);

    return $.html();
  };

  return {
    updateElementDom,
  };
}
