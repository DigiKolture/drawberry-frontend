<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorPickerStyle
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "SidebarBackgroundColorStyle",
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const show = ref(true);

    const name = "background-color";

    const colorPickerStyleRef = ref();

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );

    const color = ref({
      hex8: "#aaaaaa",
    });

    const updateColor = (newVal: any) => {
      color.value = newVal;
    };

    return {
      show,
      color,
      colorPickerStyleRef,
      updateColor,
    };
  },
});
</script>
