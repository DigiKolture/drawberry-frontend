<template>
  <div class="projects__empty">
    <h6>Start designing your audience’s inbox</h6>
    <p>Bring your ideas to life!</p>
    <BaseButtonTextIcon
      @click="createProject"
      class="grey projects__empty__btn"
      icon="add"
      text="New Project"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon.vue";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "ProjectsEmpty",
  components: { BaseButtonTextIcon },

  setup() {
    const createProject = () => {
      // emit("create-project");
      store
        .dispatch("projects/storeProject", {
          name: "Untitled project",
        })
        .then((data) => {
          store.commit("projects/SET_PROJECT", data.project);
          router.push({ name: "Canvas", params: { id: data.project.id } });
        });
    };
    return {
      createProject,
    };
  },
});
</script>

<style></style>
