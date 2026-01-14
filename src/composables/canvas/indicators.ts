import store from "@/store";
import { computed } from "vue";
import { ui } from "@/assets/js/canvas";
import { focus } from "@/composables/canvas/focus";
import router from "@/router";

export function indicators() {
  const validateIndicator = (fromIndex: number, toIndex: number) => {
    if (fromIndex == null) return false;
    if (fromIndex == toIndex) return false;
    if (fromIndex < toIndex && Math.abs(fromIndex - toIndex) < 2) return false;
    if (toIndex > fromIndex && Math.abs(fromIndex - toIndex) < 1) return false;

    return true;
  };

  // Only validate indicators if user is trying to move components within the workspace and not adding from sidebar
  const validateWorkspaceIndicator = (
    type: string,
    fromIndex: number,
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
