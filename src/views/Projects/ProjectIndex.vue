<template>
  <AppLayout :title="title" :description="description">
    <div class="projects__container">
      <div class="projects__empty">
        <h6>Start designing your audience’s inbox</h6>
        <p>Bring your ideas to life!</p>
        <button class="button__icon">
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

export default defineComponent({
  name: "ProjectIndex",
  components: { BaseIcon, AppLayout },

  setup() {
    const title = "All Projects";
    const description =
      "Manage your projects, create or add projects to folders.";

    return {
      title,
      description,
    };
  },
});
</script>
