import { helpers } from "@/composables/helpers";

export function layers() {
  const { sliceString } = helpers();
  const getLayerElementTitle = (element: any): string => {
    const id = element.id.toLowerCase();
    const text = element.innerHtml;

    if (text) {
      return sliceString(text, 16);
    } else if (id.includes("background")) {
      return "Background";
    } else if (id.includes("logo")) {
      return "Logo";
    } else if (id.includes("image")) {
      return "Image";
    }

    const splitArray = id.split("_");
    return splitArray.length > 1 ? sliceString(splitArray[1]) : sliceString(id);
  };

  const getLayerElementIcon = (element: any): string => {
    const id = element.id.toLowerCase();
    const text = element.innerHtml;
    let icon = "";
    if (text) {
      icon = "text";
    } else if (id.includes("background")) {
      icon = "background";
    } else if (id.includes("logo")) {
      icon = "image";
    } else if (id.includes("image")) {
      icon = "image";
    } else {
      icon = "text";
    }
    return `canvas/sidebar/layers/${icon}`;
  };

  return {
    getLayerElementTitle,
    getLayerElementIcon,
  };
}
