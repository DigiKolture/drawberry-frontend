<template>
  <header class="header">
    <div class="header__container">
      <div class="header__container__left">
        <div class="header__logo">
          <BaseIcon icon="logo/white" />
        </div>
        <HeaderContainerLeft v-if="isCanvas && !isPreview" />
        <HeaderProjectInput
          :is-canvas="isCanvas"
          :is-disabled="true"
          v-if="isPreview && project"
        />
      </div>
      <HeaderContainerMiddle
        :is-auth="isAuth"
        :is-canvas="isCanvas"
        :is-preview="isPreview"
        :current-preview="currentPreview"
      />
      <HeaderContainerRight
        :is-auth="isAuth"
        :is-canvas="isCanvas"
        :is-preview="isPreview"
      ></HeaderContainerRight>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { useRoute } from "vue-router";

import store from "@/store";
import HeaderContainerRight from "@/components/header/position/HeaderContainerRight.vue";
import HeaderContainerMiddle from "@/components/header/position/HeaderContainerMiddle.vue";
import HeaderProjectInput from "@/components/header/project/HeaderProjectInput.vue";
import HeaderContainerLeft from "@/components/header/position/HeaderContainerLeft.vue";
export default defineComponent({
  name: "HeaderComponent",
  components: {
    HeaderContainerLeft,
    HeaderProjectInput,
    HeaderContainerMiddle,
    HeaderContainerRight,
    BaseIcon,
  },

  setup() {
    const route = useRoute();

    const updatePreviewTabs = (preview: string | null) => {
      store.commit("preview/SET_CURRENT_PREVIEW", preview);
    };

    const authUser = computed(() => {
      return store.getters["auth/authUser"];
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const currentPreview = computed(() => {
      return store.getters["preview/currentPreview"];
    });

    const isCanvas = computed(() => {
      return route.name === "Canvas";
    });

    const isAuth = computed(() => {
      return authUser.value !== null;
    });

    const isPreview = computed(() => {
      return route.name === "Preview";
    });

    return {
      project,
      route,
      currentPreview,
      isCanvas,
      updatePreviewTabs,
      isPreview,
      isAuth,
    };
  },
});
</script>

<style></style>
