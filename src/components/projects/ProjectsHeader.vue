<template>
  <div class="projects__header">
    <button
      id="modals-trigger"
      @click="createProject"
      class="projects__header__create"
    >
      <BaseIcon icon="add" />
      <span>Create new project</span>
    </button>

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
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "ProjectsHeader",
  components: { BaseIcon },

  setup(_, { emit }) {
    const searchName = ref("");
    const isInputFocused = ref(false);

    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    watch(searchName, () => {
      // TODO: Include search in API when we add pagination
      emit("update-search-name", searchName.value);
      if (searchName.value) {
        const search = searchName.value.toLowerCase();
        const regex = new RegExp(searchName.value, "i");

        const filteredProjects = projects.value.filter((project: any) =>
          regex.test(project.name)
        );

        filteredProjects.sort((a: any, b: any) => {
          const aIndex = a.name.toLowerCase().indexOf(search);
          const bIndex = b.name.toLowerCase().indexOf(search);
          return aIndex - bIndex;
        });

        store.commit("projects/SET_FILTERED_PROJECTS", filteredProjects);
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
      searchName,
      isInputFocused,
      blur,
      focus,
      reset,
      createProject,
    };
  },
});
</script>

<style></style>
