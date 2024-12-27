import { computed, ref, watch } from "vue";
import store from "@/store";

export function projectActions(action = "") {
  const name = ref("");
  const description = ref("");

  const currentProjectId = ref("");

  const projectItemIndex = computed(() => {
    return store.getters["modals/projectItem"];
  });

  const projects = computed(() => {
    return store.getters["projects/projects"];
  });

  watch(projectItemIndex, () => {
    if (projectItemIndex.value >= 0) {
      // One was added to the project index when setting the value, so we need to subtract one
      currentProjectId.value = projects.value[projectItemIndex.value - 1].id;
      if (action === "update") {
        name.value = `${projects.value[projectItemIndex.value - 1].name}`;
      } else if (action === "duplicate") {
        name.value = `Copy of ${
          projects.value[projectItemIndex.value - 1].name
        }`;
      } else if (action === "delete") {
        description.value = `${
          projects.value[projectItemIndex.value - 1].name
        } will be deleted permanently.`;
      }
    }
  });

  return {
    name,
    description,
    currentProjectId,
  };
}
