<template>
  <div v-if="sidebarNavContent" class="canvas__sidebar__nav__content">
    <div class="sidebar__nav__contents__header">
      <h4>{{ formatContentTitle }}</h4>
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
        <ComponentsContainer />
        <ComponentItemsContainer />
      </div>
      <div v-if="showContent('style')" class="sidebar__nav__content__item">
        <h1>Style</h1>
      </div>
      <div v-if="showContent('layers')" class="sidebar__nav__content__item">
        <LayersContainer />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";
import ComponentsContainer from "@/components/canvas/sidebar/components/ComponentsContainer.vue";
import ComponentItemsContainer from "@/components/canvas/sidebar/component-items/ComponentItemsContainer.vue";
import LayersContainer from "@/components/canvas/sidebar/layers/LayersContainer.vue";

export default defineComponent({
  name: "CanvasSidebarNavContent",
  components: {
    LayersContainer,
    ComponentItemsContainer,
    ComponentsContainer,
    BaseButtonIcon,
  },
  setup() {
    const content = ref("");

    const sidebarNavContent = computed(() => {
      return store.getters["canvas/sidebarNavContent"];
    });

    const sidebarDock = computed(() => {
      return store.getters["canvas/sidebarDock"];
    });

    const showContent = (name: string) => {
      return name === sidebarNavContent.value;
    };

    const formatContentTitle = computed(() => {
      if (!sidebarNavContent.value) return sidebarNavContent.value;

      const title = sidebarNavContent.value.split("_").join(" ");
      const [firstLetter, ...remLetters] = title;
      return firstLetter.toUpperCase() + remLetters.join("");
    });

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
      formatContentTitle,
      toggleSidebarDock,
    };
  },
});
</script>
