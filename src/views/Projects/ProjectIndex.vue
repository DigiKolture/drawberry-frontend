<template>
  <AppLayout :title="title" :description="description">
    <div class="projects__container">
      <ProjectsSkeleton v-if="loading" />

      <template v-else>
        <ProjectsEmpty v-if="projects.length === 0" />
        <ProjectsSection />
      </template>
    </div>
    <div class="view__bg">
      <router-view @close="close" />
    </div>
  </AppLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import AppLayout from "@/components/layout/AppLayout";
import store from "@/store";
import router from "@/router";
import ProjectsEmpty from "@/components/projects/ProjectsEmpty";
import ProjectsSection from "@/components/projects/ProjectsSection";
import ProjectsSkeleton from "@/components/projects/ProjectsSkeleton.vue";

export default defineComponent({
  name: "ProjectIndex",
  components: { ProjectsSkeleton, ProjectsSection, ProjectsEmpty, AppLayout },

  setup() {
    const title = "All Projects";
    const description =
      "Manage your projects, create or add projects to folders.";

    const loading = ref(false);

    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    onMounted(async () => {
      loading.value = true;
      await Promise.all([
        store.dispatch("projects/getProjects"),
        store.dispatch("folders/getFolders"),
      ]);
      loading.value = false;
    });

    const close = () => {
      router.push({ name: "ProjectIndex" });
    };

    return {
      title,
      loading,
      description,
      close,
      projects,
    };
  },
});
</script>
