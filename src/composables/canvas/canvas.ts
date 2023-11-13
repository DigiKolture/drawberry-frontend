import store from "@/store";
import { computed } from "vue";

export function canvas() {
  const hasWorkspaceComponent = computed(() => {
    return store.getters["canvas/hasWorkspaceComponent"];
  });

  return {
    hasWorkspaceComponent,
  };
}
