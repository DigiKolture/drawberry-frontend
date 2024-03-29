<template>
  <DropdownLayout :data="data" @clicks="handleEvents" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import store from "@/store";
import router from "@/router";
export default defineComponent({
  name: "ProjectCreateDropdown",
  components: { DropdownLayout },

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
        case data[0].event: {
          store.commit("modals/CLOSE_MODAL", "project_create");
          createProject();
          break;
        }

        case data[1].event: {
          store.commit("modals/OPEN_MODAL", "folder_create");
          store.commit("modals/CLOSE_MODAL", "project_create");
          break;
        }
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
