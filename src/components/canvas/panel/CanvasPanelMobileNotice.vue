<template>
  <section class="canvas__panel__mobile__notice">
    <p>Editing mobile appearance</p>
    <div>
      <BaseIcon icon="canvas/panel/info" />
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "CanvasPanelMobileNotice",
  components: { BaseIcon },
});
</script>
