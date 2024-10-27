<template>
  <div class="header__container__right">
    <template v-if="isAuth">
      <HeaderContainerRightSkeleton v-if="canvasLoading" />
      <div class="header__right__canvas__actions" v-if="isCanvas && project">
        <HeaderProjectHistory />
        <slot>
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
        </slot>
      </div>

      <div
        class="header__right__preview"
        v-else-if="project && isPreview && isUserProject"
      >
        <BaseButtonIcon @click="goToProject()" icon="close" />
      </div>
      <div v-else-if="(isPreview && !isUserProject) || isADiffRoute">
        <div
          class="header__right__initials"
          :id="modalsTrigger"
          @click="toggleUserInitials"
        >
          <span>{{ getInitials }}</span>
          <UserInitialsDropdown :class="{ open: openUserInitials }" />
        </div>
      </div>
    </template>
    <template v-else>
      <router-link v-if="isPreview" to="/login" class="button grey">
        Login
      </router-link>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import store from "@/store";
import ExportDropdown from "@/components/header/dropdown/export/ExportDropdown.vue";
import PreviewDropdown from "@/components/header/dropdown/PreviewDropdown.vue";
import BaseButtonTextIcon from "@/components/button/BaseButtonTextIcon.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import router from "@/router";
import { auth } from "@/composables/auth/auth";
import UserInitialsDropdown from "@/components/header/dropdown/UserInitialsDropdown.vue";
import HeaderProjectHistory from "@/components/header/right/HeaderProjectHistory.vue";
import HeaderContainerRightSkeleton from "@/components/header/position/HeaderContainerRightSkeleton.vue";
import { canvas } from "@/composables/canvas/canvas";
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
    HeaderContainerRightSkeleton,
    HeaderProjectHistory,
    UserInitialsDropdown,
    BaseButton,
    BaseButtonIcon,
    BaseButtonTextIcon,
    PreviewDropdown,
    ExportDropdown,
  },

  setup(props) {
    const { getInitials } = auth();
    const { canvasLoading } = canvas();

    const modalsTrigger = "modals-trigger";

    const openExport = computed(() => {
      return store.getters["modals/export"];
    });

    const openPreview = computed(() => {
      return store.getters["modals/preview"];
    });

    const openUserInitials = computed(() => {
      return store.getters["modals/userInitials"];
    });

    const toggleExport = () => {
      store.commit("modals/TOGGLE_MODAL", "export");
    };

    const toggleShare = () => {
      store.commit("modals/TOGGLE_MODAL", "share_preview");
    };
    const toggleUserInitials = () => {
      store.commit("modals/TOGGLE_MODAL", "user_initials");
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
      canvasLoading,
      openPreview,
      getInitials,
      openExport,
      toggleShare,
      toggleExport,
      togglePreview,
      updatePreviewTabs,
      openUserInitials,
      goToProject,
      isUserProject,
      isADiffRoute,
      toggleUserInitials,
    };
  },
});
</script>

<style></style>
