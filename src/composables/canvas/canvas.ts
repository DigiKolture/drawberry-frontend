import store from "@/store";
import { computed } from "vue";

export function canvas() {
  const workspaceComponents = computed(() => {
    return store.getters["canvas/workspaceComponents"];
  });

  const hasWorkspaceComponent = computed(() => {
    return workspaceComponents.value && workspaceComponents.value.length > 0;
  });

  return {
    hasWorkspaceComponent,
  };
}
