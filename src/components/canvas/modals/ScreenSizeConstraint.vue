<template>
  <div class="screen-size-constraint" v-if="isSmallScreen && isCanvasRoute">
    <div :style="constraintStyle" class="screen-size-constraint__modal">
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
import { computed, defineComponent, ref, watch } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { screenConstraint } from "@/composables/canvas/screen-constraint";
import { useRoute } from "vue-router";
import { useWindowWidth } from "@/composables/helpers/width";

export default defineComponent({
  name: "ScreenSizeConstraint",
  components: { BaseIcon },

  setup() {
    const { isSmallScreen } = screenConstraint();
    const { windowWidth } = useWindowWidth();

    const route = useRoute();
    const isCanvasRoute = computed(() => route.name === "Canvas");

    const width = 400;

    const constraintStyle = ref({
      width: `${width}px`,
      left: `calc((${windowWidth.value}px - ${width}px) / 2)`,
    });

    watch(windowWidth, (newWidth) => {
      constraintStyle.value = {
        width: `${width}px`,
        left: `calc((${newWidth}px - ${width}px) / 2)`,
      };
    });

    return {
      isSmallScreen,
      isCanvasRoute,
      constraintStyle,
    };
  },
});
</script>

<style></style>
