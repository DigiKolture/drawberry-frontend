<template>
  <div class="projects__section">
    <div class="projects__header">
      <button @click="createProject" class="projects__header__create">
        <BaseIcon icon="add" />
        <span>Create</span>
        <BaseIcon icon="arrow/down" />
      </button>

      <div class="projects__header__search">
        <input class="projects__header__search__input" type="text" />
        <div class="projects__header__search__icon">
          <BaseIcon icon="search" />
        </div>
      </div>
    </div>

    <div class="projects__body">
      <h3 class="projects__body__title">Projects</h3>

      <div class="projects__body__list__items">
        <ProjectListItem
          :project="project"
          :key="project.id"
          v-for="project in projects"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import ProjectListItem from "@/components/projects/ProjectListItem.vue";
import store from "@/store";

export default defineComponent({
  name: "ProjectsSection",
  components: { ProjectListItem, BaseIcon },

  setup(props, { emit }) {
    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    const createProject = () => {
      emit("create-project");
    };

    return {
      projects,
      createProject,
    };
  },
});
</script>

<style></style>
