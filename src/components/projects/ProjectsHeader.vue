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

    <div
      class="projects__header__search"
      :class="{
        focus: isInputFocused,
      }"
    >
      <input
        class="projects__header__search__input"
        placeholder="Search projects"
        type="text"
        v-model="searchName"
        @focus="focus"
        @click="focus"
        @blur="blur"
      />
      <div class="projects__header__search__icon">
        <BaseIcon v-if="!searchName && !isInputFocused" icon="search" />
        <BaseIcon @click="reset" class="active" v-else icon="close-circle" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import ProjectCreateDropdown from "@/components/projects/ProjectCreateDropdown.vue";
import store from "@/store";

export default defineComponent({
  name: "ProjectsHeader",
  components: { ProjectCreateDropdown, BaseIcon },

  setup(_, { emit }) {
    const searchName = ref("");
    const isInputFocused = ref(false);

    const openCreate = computed(() => {
      return store.getters["modals/projectCreate"];
    });

    const toggleOpenCreate = () => {
      store.commit("modals/TOGGLE_MODAL", "project_create");
    };

    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    watch(searchName, () => {
      // TODO: Include search in API when we add pagination
      emit("update-search-name", searchName.value);
      if (searchName.value) {
        const regex = new RegExp(searchName.value, "i");
        store.commit(
          "projects/SET_FILTERED_PROJECTS",
          projects.value.filter((project: any) => regex.test(project.name))
        );
      } else {
        store.commit("projects/SET_FILTERED_PROJECTS", projects.value);
      }
    });
    const focus = () => {
      isInputFocused.value = true;
    };

    const blur = () => {
      isInputFocused.value = false;
    };
    const reset = () => {
      isInputFocused.value = false;
      searchName.value = "";
      store.commit("projects/SET_FILTERED_PROJECTS", projects.value);
    };

    return {
      toggleOpenCreate,
      openCreate,
      searchName,
      isInputFocused,
      blur,
      focus,
      reset,
    };
  },
});
</script>

<style></style>
