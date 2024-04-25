<template>
  <div class="projects__section">
    <ProjectsHeader @updateSearchName="updateSearchName" />

    <FilteredProjectsEmpty
      v-if="filteredProjects.length === 0"
      :search-name="searchName"
    />

    <div v-if="filteredProjects.length > 0" class="projects__body">
      <h3 class="projects__body__title">Projects</h3>
      <div class="projects__body__list__items">
        <ProjectListItem
          :project="project"
          :index="key + 1"
          :key="project.id"
          v-for="(project, key) in filteredProjects"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ProjectListItem from "@/components/projects/ProjectListItem.vue";
import store from "@/store";
import ProjectsHeader from "@/components/projects/ProjectsHeader.vue";
import FilteredProjectsEmpty from "@/components/projects/FilteredProjectsEmpty.vue";

export default defineComponent({
  name: "ProjectsSection",
  components: {
    FilteredProjectsEmpty,
    ProjectsHeader,
    ProjectListItem,
  },

  setup(props, { emit }) {
    const searchName = ref("");

    const filteredProjects = computed(() => {
      return store.getters["projects/filteredProjects"];
    });

    const folders = computed(() => {
      return store.getters["folders/folders"];
    });

    const createProject = () => {
      emit("create-project");
    };
    const updateSearchName = (name: string) => {
      searchName.value = name;
    };

    return {
      searchName,
      filteredProjects,
      folders,
      createProject,
      updateSearchName,
    };
  },
});
</script>

<style></style>
