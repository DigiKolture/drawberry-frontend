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
        <button class="button__text__icon success">
          <BaseIcon icon="header/export" /> <span>Export</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";
import { useRoute } from "vue-router";

import store from "@/store";
export default defineComponent({
  name: "HeaderComponent",
  components: { BaseIcon },

  setup() {
    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const route = useRoute();

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
      isCanvas,
      updateProjectName,
    };
  },
});
</script>

<style></style>
