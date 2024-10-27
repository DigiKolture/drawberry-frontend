<template>
  <nav class="canvas__sidebar__nav">
    <CanvasSidebarNavTopSkeleton v-if="canvasLoading" />
    <div v-else class="sidebar__nav__top">
      <BaseButtonIcon
        :key="key"
        v-for="(button, key) in sidebarNavTopIcons"
        @click="changeSidebarNavContent(button.name)"
        :icon="button.icon"
        :class="{ active: activeContent(button.name) }"
      />
    </div>
    <div class="sidebar__nav__bottom">
      <BaseButtonIcon
        :key="key"
        v-for="(button, key) in sidebarNavBottomIcons"
        :icon="button.icon"
      />

      <div
        @click="toggleUserInitials"
        id="modals-trigger"
        class="sidebar__nav__bottom__initials"
      >
        {{ getInitials }}
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";
import { auth } from "@/composables/auth/auth";
import CanvasSidebarNavTopSkeleton from "@/components/canvas/sidebar/CanvasSidebarNavTopSkeleton.vue";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "CanvasSidebarNav",
  components: { CanvasSidebarNavTopSkeleton, BaseButtonIcon },

  setup() {
    const { getInitials } = auth();
    const { canvasLoading } = canvas();

    const sidebarNavTopIcons = [
      { icon: "canvas/sidebar/nav/add", name: "add_component" },
      { icon: "canvas/sidebar/nav/style", name: "style" },
      { icon: "canvas/sidebar/nav/layer", name: "layers" },
    ];

    const sidebarNavBottomIcons: any = [
      // { icon: "canvas/sidebar/nav/library" },
      // { icon: "canvas/sidebar/nav/notification" },
    ];

    const sidebarNavContent = computed(() => {
      return store.getters["canvas/sidebarNavContent"];
    });

    const activeContent = (name: string) => {
      return name === sidebarNavContent.value;
    };

    const changeSidebarNavContent = (name: string) => {
      store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", name);
    };

    const toggleUserInitials = () => {
      store.commit("modals/TOGGLE_MODAL", "user_initials");
    };

    return {
      canvasLoading,
      getInitials,
      sidebarNavTopIcons,
      sidebarNavBottomIcons,
      sidebarNavContent,
      activeContent,
      changeSidebarNavContent,
      toggleUserInitials,
    };
  },
});
</script>
