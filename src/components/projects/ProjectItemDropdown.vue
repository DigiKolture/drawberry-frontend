<template>
  <DropdownLayout :data="data" @clicks="handleEvents" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import store from "@/store";
export default defineComponent({
  name: "ProjectItemDropdown",
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
        name: "Move to folder",
        event: "move",
      },
      {
        icon: "projects/dropdown/edit",
        name: "Edit file",
        event: "edit",
      },
      {
        icon: "projects/dropdown/delete",
        name: "Delete",
        event: "delete",
      },
    ];

    const handleEvents = (event: string) => {
      console.log({ event });
      switch (event) {
        case data[0].event: {
          store.commit("modals/OPEN_MODAL", "project_duplicate");
          store.commit("modals/CLOSE_MODAL", "project_item");
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
