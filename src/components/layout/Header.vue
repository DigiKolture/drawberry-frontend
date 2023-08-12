<template>
  <header class="header">
    <div class="header__container">
      <div class="header__container__left">
        <div class="header__logo">
          <BaseIcon icon="logo/white" />
        </div>
        <router-link
          to="/projects"
          v-if="isCanvas && !isPreview"
          class="header__home"
        >
          <button><BaseIcon icon="arrow/left" /></button>
          <button><BaseIcon icon="header/home" /></button>
        </router-link>
      </div>
      <div v-if="isCanvas && project" class="header__container__middle">
        <div class="header__middle__input__container" v-if="!isPreview">
          <input
            v-model="project.name"
            type="text"
            @keyup.enter="updateProjectName"
          />
        </div>
        <div class="header__middle__preview" v-else>
          <BaseButtonTextIcon
            :key="key"
            v-for="(preview, key) in previewTabsData"
            @click="updatePreviewTabs(preview.event)"
            :class="{ active: currentPreview === preview.event }"
            :text="preview.name"
            :icon="preview.icon"
          />
        </div>
      </div>

      <div v-if="isCanvas" class="header__container__right">
        <div class="header__right__canvas__actions" v-if="!isPreview">
          <div class="header__redo">
            <button><BaseIcon icon="header/redo/backward" /></button>
            <button><BaseIcon icon="header/redo/forward" /></button>
          </div>
          <button @click="togglePreview" class="button__text__icon">
            <BaseIcon icon="header/preview" /><span>Preview</span>
          </button>
          <button @click="toggleExport" class="button__text__icon success">
            <BaseIcon icon="header/export" /> <span>Export</span>
          </button>
          <ExportDropdown :class="{ open: openExport }" />
          <PreviewDropdown :class="{ open: openPreview }" />
        </div>
        <div class="header__right__preview" v-else>
          <BaseButtonIcon @click="updatePreviewTabs(null)" icon="close" />
        </div>
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
import PreviewDropdown from "@/components/header/dropdown/PreviewDropdown";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";
export default defineComponent({
  name: "HeaderComponent",
  components: {
    BaseButtonIcon,
    BaseButtonTextIcon,
    PreviewDropdown,
    ExportDropdown,
    BaseIcon,
  },

  setup() {
    const route = useRoute();
    const openExport = ref(false);
    const openPreview = ref(false);

    const previewTabsData = [
      {
        icon: "header/preview/desktop",
        event: "desktop",
        name: "Desktop",
      },
      {
        icon: "header/preview/mobile",
        event: "mobile",
        name: "Mobile",
      },
    ];

    const toggleExport = () => {
      openExport.value = !openExport.value;
    };

    const togglePreview = () => {
      openPreview.value = !openPreview.value;
    };

    const updatePreviewTabs = (preview) => {
      store.commit("canvas/SET_CURRENT_PREVIEW", preview);
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const currentPreview = computed(() => {
      return store.getters["canvas/currentPreview"];
    });

    const isCanvas = computed(() => {
      return route.name === "Canvas";
    });

    const isPreview = computed(() => {
      return isCanvas.value && currentPreview.value;
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
      openPreview,
      project,
      route,
      openExport,
      currentPreview,
      isCanvas,
      toggleExport,
      togglePreview,
      updatePreviewTabs,
      updateProjectName,
      isPreview,
      previewTabsData,
    };
  },
});
</script>

<style></style>
