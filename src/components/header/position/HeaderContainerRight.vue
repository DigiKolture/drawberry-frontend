<template>
  <div class="header__container__right">
    <template v-if="isAuth">
      <div class="header__right__canvas__actions" v-if="isCanvas">
        <div class="header__redo">
          <button><BaseIcon icon="header/redo/backward" /></button>
          <button><BaseIcon icon="header/redo/forward" /></button>
        </div>
        <BaseButtonTextIcon
          @click="togglePreview"
          text="Preview"
          icon="header/preview"
        />
        <BaseButton
          class="header__right__share button__outline"
          title="Share"
        />
        <BaseButtonTextIcon
          @click="toggleExport"
          class="success"
          text="Export"
          icon="header/export"
        />
        <ExportDropdown :class="{ open: openExport }" />
        <PreviewDropdown
          :is-preview="isPreview"
          :class="{ open: openPreview }"
        />
      </div>
      <div class="header__right__preview" v-else-if="isPreview">
        <BaseButtonIcon @click="goToProject(null)" icon="close" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

import store from "@/store";
import ExportDropdown from "@/components/header/dropdown/export/ExportDropdown.vue";
import PreviewDropdown from "@/components/header/dropdown/PreviewDropdown.vue";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import router from "@/router";
export default defineComponent({
  name: "HeaderContainerRight",
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
  },
  components: {
    BaseIcon,
    BaseButton,
    BaseButtonIcon,
    BaseButtonTextIcon,
    PreviewDropdown,
    ExportDropdown,
  },

  setup() {
    const openExport = ref(false);
    const openPreview = ref(false);

    const toggleExport = () => {
      openExport.value = !openExport.value;
    };

    const togglePreview = () => {
      openPreview.value = !openPreview.value;
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const goToProject = () => {
      router.push({ name: "Canvas", params: { id: project.value.id } });
    };

    const updatePreviewTabs = (preview: string) => {
      store.commit("preview/SET_CURRENT_PREVIEW", preview);
    };

    return {
      openPreview,
      openExport,
      toggleExport,
      togglePreview,
      updatePreviewTabs,
      goToProject,
    };
  },
});
</script>

<style></style>
