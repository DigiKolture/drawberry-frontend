<template>
  <nav class="canvas__sidebar__nav">
    <div class="sidebar__nav__top">
      <BaseButtonIcon
        :key="key"
        v-for="(button, key) in sidebarNavTopIcons"
        @click="changeSidebarNavContent(button.name)"
        :icon="button.icon"
      />
    </div>
    <div class="sidebar__nav__bottom">
      <BaseButtonIcon
        :key="key"
        v-for="(button, key) in sidebarNavBottomIcons"
        :icon="button.icon"
      />
      <div class="sidebar__nav__bottom__initials">KN</div>
    </div>
  </nav>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "CanvasSidebarNav",
  components: { BaseButtonIcon },

  setup() {
    const sidebarNavTopIcons = [
      { icon: "canvas/sidebar/nav/add", name: "add_component" },
      { icon: "canvas/sidebar/nav/style", name: "style" },
      { icon: "canvas/sidebar/nav/layer", name: "layer" },
    ];

    const sidebarNavBottomIcons = [
      { icon: "canvas/sidebar/nav/library" },
      { icon: "canvas/sidebar/nav/notification" },
    ];

    const changeSidebarNavContent = (name: string) => {
      store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", name);
    };

    return {
      sidebarNavTopIcons,
      sidebarNavBottomIcons,
      changeSidebarNavContent,
    };
  },
});
</script>
