<template>
  <div class="canvas__sidebar__nav__content">
    <div class="sidebar__nav__contents__header">
      <h4>Add Component</h4>
      <div class="sidebar__nav__contents__header__icons">
        <BaseButtonIcon icon="canvas/sidebar/content/dock" />
        <BaseButtonIcon icon="canvas/sidebar/content/close" />
      </div>
    </div>
    <div class="sidebar__nav__contents__body">
      <div class="sidebar__nav__content__item">
        <h1>Component</h1>
      </div>
      <div class="sidebar__nav__content__item">
        <h1>Style</h1>
      </div>
      <div class="sidebar__nav__content__item">
        <h1>Layer</h1>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";

export default defineComponent({
  name: "CanvasSidebarNavContent",
  components: { BaseButtonIcon },
  setup() {
    const content = ref("");

    return {
      content,
    };
  },
});
</script>
