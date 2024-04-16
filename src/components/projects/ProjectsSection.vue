<template>
  <div class="projects__section">
    <ProjectsHeader />

    <div v-if="folders.length > 0" class="projects__body">
      <h3 class="projects__body__title">Folder</h3>
      <div class="folders__body__list__items">
        <FolderListItem
          :key="folder.id"
          :index="key + 1"
          :folder="folder"
          v-for="(folder, key) in folders"
        />
      </div>
    </div>
    <div v-if="projects.length > 0" class="projects__body">
      <h3 class="projects__body__title">Projects</h3>
      <div class="projects__body__list__items">
        <ProjectListItem
          :project="project"
          :index="key + 1"
          :key="project.id"
          v-for="(project, key) in projects"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import ProjectListItem from "@/components/projects/ProjectListItem.vue";
import store from "@/store";
import FolderListItem from "@/components/folders/FolderListItem.vue";
import ProjectsHeader from "@/components/projects/ProjectsHeader.vue";

export default defineComponent({
  name: "ProjectsSection",
  components: { ProjectsHeader, FolderListItem, ProjectListItem },

  setup(props, { emit }) {
    const projects = computed(() => {
      return store.getters["projects/filteredProjects"];
    });

    const folders = computed(() => {
      return store.getters["folders/folders"];
    });

    const createProject = () => {
      emit("create-project");
    };

    return {
      projects,
      folders,
      createProject,
    };
  },
});
</script>

<style></style>
