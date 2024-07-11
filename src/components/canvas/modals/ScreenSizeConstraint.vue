<template>
  <div class="screen-size-constraint" v-if="isSmallScreen && isCanvasRoute">
    <div class="screen-size-constraint__modal">
      <BaseIcon icon="canvas/size-constraint" />
      <div class="screen-size-constraint__content">
        <h5>Your browser size is to small</h5>
        <p>
          Resize your browser to be at least 900px wide to continue designing
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { screenConstraint } from "@/composables/canvas/screen-constraint";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ScreenSizeConstraint",
  components: { BaseIcon },

  setup() {
    const { isSmallScreen } = screenConstraint();
    const route = useRoute();
    const isCanvasRoute = computed(() => route.name === "Canvas");

    return {
      isSmallScreen,
      isCanvasRoute,
    };
  },
});
</script>

<style></style>
