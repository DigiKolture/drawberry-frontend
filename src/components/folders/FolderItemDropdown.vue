<template>
  <DropdownLayout :data="data" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
export default defineComponent({
  name: "FolderItemDropdown",
  components: { DropdownLayout },

  setup() {
    const data = [
      {
        icon: "projects/dropdown/duplicate",
        name: "Duplicate",
      },
      {
        icon: "projects/dropdown/open",
        name: "Open Folder",
      },
      {
        icon: "projects/dropdown/edit",
        name: "Rename",
      },
      {
        icon: "projects/dropdown/delete",
        name: "Delete",
      },
    ];

    return {
      data,
    };
  },
});
</script>

<style></style>
