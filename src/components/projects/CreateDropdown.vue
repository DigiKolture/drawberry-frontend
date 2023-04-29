<template>
  <ProjectDropdownLayout :data="data" @events="handleEvents" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProjectDropdownLayout from "@/components/layout/dropdown/ProjectDropdownLayout.vue";
import store from "@/store";
import router from "@/router";
export default defineComponent({
  name: "CreateDropdown",
  components: { ProjectDropdownLayout },

  setup() {
    const data = [
      {
        icon: "projects/dropdown/new-project",
        name: "New Project",
        event: "create-project",
      },
      {
        icon: "projects/dropdown/new-folder",
        name: "New Folder",
        event: "create-folder",
      },
    ];

    const handleEvents = (event: string) => {
      switch (event) {
        case data[0].event:
          createProject();
          break;

        case data[1].event:
          router.push({ name: "CreateFolder" });
          break;
      }
    };

    const createProject = async () => {
      await store
        .dispatch("projects/storeProject", {
          name: "Untitled project",
        })
        .then((data) => {
          store.commit("projects/SET_PROJECT", data.project);
          router.push({ name: "Canvas", params: { id: data.project.id } });
        });
    };

    return {
      data,
      handleEvents,
    };
  },
});
</script>

<style></style>
