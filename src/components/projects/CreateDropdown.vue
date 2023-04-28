<template>
  <ProjectDropdownLayout :data="data" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProjectDropdownLayout from "@/components/layout/dropdown/ProjectDropdownLayout.vue";
export default defineComponent({
  name: "CreateDropdown",
  components: { ProjectDropdownLayout },

  setup() {
    const data = [
      {
        icon: "projects/dropdown/new-project",
        name: "New Project",
      },
      {
        icon: "projects/dropdown/new-folder",
        name: "New Folder",
      },
    ];

    return {
      data,
    };
  },
});
</script>

<style></style>
