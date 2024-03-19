<template>
  <DropdownLayout :data="data" @clicks="handleEvents" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import store from "@/store";
export default defineComponent({
  name: "FolderItemDropdown",
  components: { DropdownLayout },

  setup() {
    const data = [
      {
        icon: "projects/dropdown/duplicate",
        name: "Duplicate",
        event: "duplicate",
      },
      {
        icon: "projects/dropdown/open",
        name: "Open Folder",
        event: "open",
      },
      {
        icon: "projects/dropdown/edit",
        name: "Rename",
        event: "rename",
      },
      {
        icon: "projects/dropdown/delete",
        name: "Delete",
        event: "delete",
      },
    ];

    const handleEvents = (event: string) => {
      switch (event) {
        case data[0].event: {
          store.commit("modals/OPEN_MODAL", "folder_duplicate");
          store.commit("modals/CLOSE_MODAL", "folder_item");
          break;
        }
      }
    };

    return {
      data,
      handleEvents,
    };
  },
});
</script>

<style></style>
