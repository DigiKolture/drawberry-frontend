<template>
  <div class="canvas__breakpoint__bar">
    <div
      @click.stop="updateBreakpoint(CanvasBreakpoints.DESKTOP)"
      class="canvas__breakpoint__bar__desktop"
      :class="{ active: isDesktopBreakpoint }"
    >
      <div
        class="canvas__breakpoint_button desktop-breakpoint"
        @click.stop="updateBreakpoint(CanvasBreakpoints.DESKTOP)"
        :class="{ active: isDesktopBreakpoint }"
      >
        <BaseIcon icon="canvas/workspace/breakpoint/desktop" />
      </div>
      <div
        @click.stop="updateBreakpoint(CanvasBreakpoints.MOBILE)"
        class="canvas__breakpoint__bar__mobile"
        :class="{ active: isMobileBreakpoint }"
      >
        <div
          @click.stop="updateBreakpoint(CanvasBreakpoints.MOBILE)"
          class="canvas__breakpoint_button"
          :class="{ active: isMobileBreakpoint }"
        >
          <BaseIcon icon="canvas/workspace/breakpoint/mobile" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { CanvasBreakpoints } from "@/store/modules/canvas/types";
import store from "@/store";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "CanvasBreakpointBar",
  components: { BaseIcon },

  setup() {
    const { canvasLoaded } = canvas();

    const breakpoint = computed(() => store.getters["canvas/breakpoint"]);
    const updateBreakpoint = async (string: CanvasBreakpoints) => {
      store.commit("canvas/SET_BREAKPOINT", string);
    };

    const isMobileBreakpoint = computed(
      () => canvasLoaded.value && breakpoint.value === CanvasBreakpoints.MOBILE
    );

    const isDesktopBreakpoint = computed(
      () => canvasLoaded.value && breakpoint.value === CanvasBreakpoints.DESKTOP
    );

    return {
      breakpoint,
      isMobileBreakpoint,
      isDesktopBreakpoint,
      updateBreakpoint,
      CanvasBreakpoints,
    };
  },
});
</script>
