import { computed, ref, watch } from "vue";
import store from "@/store";

export function folderActions(action = "") {
  const name = ref("");
  const description = ref("");

  const currentFolderId = ref("");

  const folderItemIndex = computed(() => {
    return store.getters["modals/folderItem"];
  });

  const folders = computed(() => {
    return store.getters["folders/folders"];
  });

  watch(folderItemIndex, () => {
    if (folderItemIndex.value >= 0) {
      // One was added to the folder index when setting the value, so we need to subtract one
      currentFolderId.value = folders.value[folderItemIndex.value - 1].id;
      if (action === "update") {
        name.value = `${folders.value[folderItemIndex.value - 1].name}`;
      } else if (action === "duplicate") {
        name.value = `Copy of ${folders.value[folderItemIndex.value - 1].name}`;
      } else if (action === "delete") {
        description.value = `${
          folders.value[folderItemIndex.value - 1].name
        } will be deleted permanently.`;
      }
    }
  });

  return {
    name,
    description,
    currentFolderId,
  };
}
