<template>
  <div class="header__container__middle">
    <template v-if="isAuth">
      <HeaderProjectInput v-if="isCanvas && project" />
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

<script>
import { computed, defineComponent, onMounted, ref } from "vue";

import store from "@/store";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon.vue";
import router from "@/router";
import HeaderProjectInput from "@/components/header/project/HeaderProjectInput.vue";
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
    HeaderProjectInput,
    BaseButtonTextIcon,
  },

  setup() {
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

    const inputField = ref(null);

    const scrollInputToStart = () => {
      if (inputField.value) {
        inputField.value.scrollLeft = 0;
      }
    };

    onMounted(() => {
      scrollInputToStart();
    });

    const toggleExport = () => {
      openExport.value = !openExport.value;
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const togglePreview = () => {
      openPreview.value = !openPreview.value;
    };

    const updatePreviewTabs = (preview) => {
      store.commit("preview/SET_CURRENT_PREVIEW", preview);
    };

    const updateProjectName = (e) => {
      store.dispatch("projects/updateProject", {
        id: project.value.id,
        data: {
          name: project.value.name,
        },
      });
      scrollInputToStart();
    };

    return {
      openPreview,
      openExport,
      project,
      inputField,
      toggleExport,
      previewTabsData,
      updateProjectName,
      scrollInputToStart,
      togglePreview,
      updatePreviewTabs,
    };
  },
});
</script>

<style></style>
