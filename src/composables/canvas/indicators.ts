import store from "@/store";
import { computed } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";
import router from "@/router";

export function indicators() {
  const validateIndicator = (fromIndex: string, toIndex: number) => {
    const parsedFromIndex = fromIndex ? parseInt(fromIndex) : null;

    if (parsedFromIndex == null) return false;
    if (parsedFromIndex == toIndex) return false;
    if (parsedFromIndex < toIndex && Math.abs(parsedFromIndex - toIndex) < 2)
      return false;
    if (toIndex > parsedFromIndex && Math.abs(parsedFromIndex - toIndex) < 1)
      return false;

    return true;
  };

  // Only validate indicators if user is trying to move components within the workspace and not adding from sidebar
  const validateWorkspaceIndicator = (
    type: string,
    fromIndex: string,
    toIndex: number
  ) => {
    //Checking if type is not provided (Incase of dragging the element and not the component itself)
    if (!type) return false;
    if (type != "from-workspace") return true;
    return validateIndicator(fromIndex, toIndex);
  };

  return {
    validateIndicator,
    validateWorkspaceIndicator,
  };
}
