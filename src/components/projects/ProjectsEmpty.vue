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

export default defineComponent({
  name: "ProjectsEmpty",
  components: { BaseButtonTextIcon },

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
