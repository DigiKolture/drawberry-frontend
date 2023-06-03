<template>
  <section class="canvas__panel__empty">
    <div>
      <BaseIcon icon="canvas/panel/empty" />
    </div>
    <p>
      You can select an element on the canvas to reveal the edit options on this
      panel.
    </p>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "CanvasPanelEmpty",
  components: { BaseIcon },
});
</script>
