<template>
  <nav class="canvas__sidebar__nav">
    <div class="sidebar__nav__top">
      <BaseButtonIcon class="" icon="canvas/sidebar/nav/add" />
      <BaseButtonIcon icon="canvas/sidebar/nav/style" />
      <BaseButtonIcon icon="canvas/sidebar/nav/layer" />
    </div>
    <div class="sidebar__nav__bottom">
      <BaseButtonIcon icon="canvas/sidebar/nav/library" />
      <BaseButtonIcon icon="canvas/sidebar/nav/notification" />
      <div class="sidebar__nav__bottom__initials">KN</div>
    </div>
  </nav>
  <CanvasSidebarNavContent />
</template>
<script>
import { defineComponent } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";
import CanvasSidebarNavContent from "@/components/canvas/sidebar/CanvasSidebarNavContent";

export default defineComponent({
  name: "CanvasSidebarNav",
  components: { CanvasSidebarNavContent, BaseButtonIcon },
});
</script>
