<template>
  <div class="header__container__middle">
    <template v-if="isAuth">
      <div class="header__middle__input__container" v-if="isCanvas && project">
        <input
          v-model="project.name"
          type="text"
          @keyup.enter="updateProjectName"
        />
      </div>
      <div class="header__middle__preview" v-else-if="isPreview">
        <BaseButtonTextIcon
          :key="key"
          v-for="(preview, key) in previewTabsData"
          @click="updatePreviewTabs(preview.event)"
          :class="{ active: currentPreview === preview.event }"
          :text="preview.name"
          :icon="preview.icon"
        />
      </div>
    </template>
    <template v-else>
      <div v-if="isPreview" class="header__middle__preview">
        <BaseButtonTextIcon
          :key="key"
          v-for="(preview, key) in previewTabsData"
          @click="updatePreviewTabs(preview.event)"
          :class="{ active: currentPreview === preview.event }"
          :text="preview.name"
          :icon="preview.icon"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

import store from "@/store";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon.vue";
import router from "@/router";
export default defineComponent({
  name: "HeaderContainerMiddle",
  props: {
    isCanvas: {
      type: Boolean,
      required: true,
    },
    isPreview: {
      type: Boolean,
      required: true,
    },
    isAuth: {
      type: Boolean,
      required: true,
    },
    currentPreview: {
      type: String,
      required: true,
    },
  },
  components: {
    BaseButtonTextIcon,
  },

  setup(props) {
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

    const openExport = ref(false);
    const openPreview = ref(false);

    const toggleExport = () => {
      openExport.value = !openExport.value;
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const togglePreview = () => {
      openPreview.value = !openPreview.value;
    };

    const updatePreviewTabs = (preview: string) => {
      store.commit("preview/SET_CURRENT_PREVIEW", preview);
    };

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
      openExport,
      project,
      toggleExport,
      previewTabsData,
      updateProjectName,
      togglePreview,
      updatePreviewTabs,
    };
  },
});
</script>

<style></style>
