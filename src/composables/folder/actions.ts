import { computed, ref, watch } from "vue";
import store from "@/store";

export function folderActions() {
  const name = ref("");
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
      name.value = `Copy of ${folders.value[folderItemIndex.value - 1].name}`;
    }
  });

  return {
    name,
    currentFolderId,
  };
}
