<template>
  <div v-if="sidebarNavContent" class="canvas__sidebar__nav__content">
    <div class="sidebar__nav__contents__header">
      <h4>Add Component</h4>
      <div class="sidebar__nav__contents__header__icons">
        <BaseButtonIcon
          @click="toggleSidebarDock"
          class="content__sidebar__dock__button"
          :class="{ active: sidebarDock }"
          icon="canvas/sidebar/content/dock"
        />
        <BaseButtonIcon
          @click="closeSidebarNavContent"
          icon="canvas/sidebar/content/close"
        />
      </div>
    </div>
    <div class="sidebar__nav__contents__body">
      <div
        v-if="showContent('add_component')"
        class="sidebar__nav__content__item"
      >
        <h1>Component</h1>
      </div>
      <div v-if="showContent('style')" class="sidebar__nav__content__item">
        <h1>Style</h1>
      </div>
      <div v-if="showContent('layer')" class="sidebar__nav__content__item">
        <h1>Layer</h1>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, ref } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";
import store from "@/store";

export default defineComponent({
  name: "CanvasSidebarNavContent",
  components: { BaseButtonIcon },
  setup() {
    const content = ref("");

    const sidebarNavContent = computed(() => {
      return store.getters["canvas/sidebarNavContent"];
    });

    const sidebarDock = computed(() => {
      return store.getters["canvas/sidebarDock"];
    });

    const showContent = (name) => {
      return name === sidebarNavContent.value;
    };

    const closeSidebarNavContent = () => {
      store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", null);
    };

    const toggleSidebarDock = () => {
      store.commit("canvas/SET_SIDEBAR_DOCK", !sidebarDock.value);
    };

    return {
      sidebarNavContent,
      sidebarDock,
      showContent,
      closeSidebarNavContent,
      toggleSidebarDock,
    };
  },
});
</script>
