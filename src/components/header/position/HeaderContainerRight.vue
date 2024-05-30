<template>
  <div class="header__container__right">
    <template v-if="isAuth">
      <div class="header__right__canvas__actions" v-if="isCanvas && project">
        <div class="header__redo">
          <button><BaseIcon icon="header/redo/backward" /></button>
          <button><BaseIcon icon="header/redo/forward" /></button>
        </div>
        <BaseButtonTextIcon
          :id="modalsTrigger"
          @click="togglePreview"
          text="Preview"
          icon="header/preview"
        />
        <BaseButton
          :id="modalsTrigger"
          class="header__right__share button__outline"
          title="Share"
          @click="toggleShare"
        />
        <BaseButtonTextIcon
          :id="modalsTrigger"
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

      <div
        class="header__right__preview"
        v-else-if="project && isPreview && isUserProject"
      >
        <BaseButtonIcon @click="goToProject()" icon="close" />
      </div>
      <div v-else-if="(isPreview && !isUserProject) || isADiffRoute">
        <div class="header__right__initials">
          <span>{{ getInitials }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <router-link to="/login" class="button grey"> Login </router-link>
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
import { auth } from "@/composables/auth/auth";
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

  setup(props) {
    const { getInitials } = auth();
    const modalsTrigger = "modals-trigger";

    const openExport = computed(() => {
      return store.getters["modals/export"];
    });

    const openPreview = computed(() => {
      return store.getters["modals/preview"];
    });

    const toggleExport = () => {
      store.commit("modals/TOGGLE_MODAL", "export");
    };

    const toggleShare = () => {
      store.commit("modals/TOGGLE_MODAL", "share_preview");
    };

    const togglePreview = () => {
      store.commit("modals/TOGGLE_MODAL", "preview");
    };

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const authUser = computed(() => {
      return store.getters["auth/authUser"];
    });

    const isADiffRoute = computed(() => {
      return !props.isCanvas && !props.isPreview;
    });

    const goToProject = () => {
      router.push({ name: "Canvas", params: { id: project.value.id } });
    };

    const isUserProject = computed(() => {
      return (
        props.isAuth &&
        project.value &&
        authUser.value.id === project.value.user
      );
    });

    const updatePreviewTabs = (preview: string) => {
      store.commit("preview/SET_CURRENT_PREVIEW", preview);
    };

    return {
      project,
      modalsTrigger,
      openPreview,
      getInitials,
      openExport,
      toggleShare,
      toggleExport,
      togglePreview,
      updatePreviewTabs,
      goToProject,
      isUserProject,
      isADiffRoute,
    };
  },
});
</script>

<style></style>
