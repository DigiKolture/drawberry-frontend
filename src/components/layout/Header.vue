<template>
  <header class="header">
    <div class="header__container">
      <div class="header__container__left">
        <div class="header__logo">
          <BaseIcon icon="logo/white" />
        </div>
        <router-link to="/projects" v-if="isCanvas" class="header__home">
          <button><BaseIcon icon="arrow/left" /></button>
          <button><BaseIcon icon="header/home" /></button>
        </router-link>
      </div>
      <div v-if="isCanvas && project" class="header__container__middle">
        <input
          v-model="project.name"
          type="text"
          @keyup.enter="updateProjectName"
        />
      </div>

      <div v-if="isCanvas" class="header__container__right">
        <div class="header__redo">
          <button><BaseIcon icon="header/redo/backward" /></button>
          <button><BaseIcon icon="header/redo/forward" /></button>
        </div>
        <button class="button__text__icon">
          <BaseIcon icon="header/preview" /><span>Preview</span>
        </button>
        <button @click="toggleExport" class="button__text__icon success">
          <BaseIcon icon="header/export" /> <span>Export</span>
        </button>
        <ExportDropdown :class="{ open: openExport }" />
      </div>
    </div>
  </header>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";
import { useRoute } from "vue-router";

import store from "@/store";
import ExportDropdown from "@/components/header/dropdown/ExportDropdown";
export default defineComponent({
  name: "HeaderComponent",
  components: { ExportDropdown, BaseIcon },

  setup() {
    const route = useRoute();
    const openExport = ref(true);

    const toggleExport = () => {
      openExport.value = !openExport.value;
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const isCanvas = computed(() => {
      return route.name === "Canvas";
    });

    const updateProjectName = () => {
      store.dispatch("projects/updateProject", {
        id: project.value.id,
        data: {
          name: project.value.name,
        },
      });
    };

    return {
      project,
      route,
      openExport,
      isCanvas,
      toggleExport,
      updateProjectName,
    };
  },
});
</script>

<style></style>
