<template>
  <AppLayout :title="title" :description="description">
    <div class="projects__container">
      <ProjectsEmpty
        @create-project="createProject"
        v-if="projects.length === 0"
      />

      <ProjectsSection v-else @create-project="createProject" />
    </div>
  </AppLayout>
</template>
<script>
import { computed, defineComponent, onMounted } from "vue";
import AppLayout from "@/components/layout/AppLayout";
import store from "@/store";
import router from "@/router";
import ProjectsEmpty from "@/components/projects/ProjectsEmpty";
import ProjectsSection from "@/components/projects/ProjectsSection";

export default defineComponent({
  name: "ProjectIndex",
  components: { ProjectsSection, ProjectsEmpty, AppLayout },

  setup() {
    const title = "All Projects";
    const description =
      "Manage your projects, create or add projects to folders.";

    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    onMounted(() => {
      store.dispatch("projects/getProjects");
    });

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
      title,
      description,
      projects,
      createProject,
    };
  },
});
</script>
