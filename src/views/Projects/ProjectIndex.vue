<template>
  <AppLayout :title="title" :description="description">
    <div class="projects__container">
      <div class="projects__empty">
        <h6>Start designing your audience’s inbox</h6>
        <p>Bring your ideas to life!</p>
        <button @click="createProject" class="button__icon">
          <BaseIcon icon="add" /><span>New Project</span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>
<script>
import { defineComponent } from "vue";
import AppLayout from "@/components/layout/AppLayout";
import BaseIcon from "@/components/icon/BaseIcon";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "ProjectIndex",
  components: { BaseIcon, AppLayout },

  setup() {
    const title = "All Projects";
    const description =
      "Manage your projects, create or add projects to folders.";

    const createProject = async () => {
      await store
        .dispatch("projects/storeProject", {
          name: "Untitled project",
        })
        .then((data) => {
          console.log({ data });
          store.commit("projects/SET_PROJECT", data.project);
          router.push({ name: "Canvas", params: { id: data.project.id } });
        });
    };

    return {
      title,
      description,
      createProject,
    };
  },
});
</script>
