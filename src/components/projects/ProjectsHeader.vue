<template>
  <div class="projects__header">
    <button
      id="modals-trigger"
      @click="toggleOpenCreate"
      class="projects__header__create"
    >
      <BaseIcon icon="add" />
      <span>Create</span>
      <BaseIcon :icon="`arrow/${openCreate ? 'down' : 'up'}`" />
    </button>
    <ProjectCreateDropdown :class="{ open: openCreate }" />

    <div class="projects__header__search">
      <input class="projects__header__search__input" type="text" />
      <div class="projects__header__search__icon">
        <BaseIcon icon="search" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import ProjectCreateDropdown from "@/components/projects/ProjectCreateDropdown.vue";
import store from "@/store";

export default defineComponent({
  name: "ProjectsHeader",
  components: { ProjectCreateDropdown, BaseIcon },

  setup() {
    const openCreate = computed(() => {
      return store.getters["modals/projectCreate"];
    });

    const toggleOpenCreate = () => {
      store.commit("modals/TOGGLE_MODAL", "project_create");
    };

    return {
      toggleOpenCreate,
      openCreate,
    };
  },
});
</script>

<style></style>
