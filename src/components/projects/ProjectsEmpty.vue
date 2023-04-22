<template>
  <div class="projects__empty">
    <h6>Start designing your audience’s inbox</h6>
    <p>Bring your ideas to life!</p>
    <button @click="createProject" class="button__icon__text">
      <BaseIcon icon="add" /><span>New Project</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "ProjectsEmpty",
  components: { BaseIcon },

  setup(props, { emit }) {
    const createProject = () => {
      emit("create-project");
    };
    return {
      createProject,
    };
  },
});
</script>

<style></style>
