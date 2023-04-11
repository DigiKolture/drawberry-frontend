<template>
  <PanelStyle name="color" title="Text COLOR">
    <ColorPickerStyle
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch, watchEffect } from "vue";
import PanelStyle from "./PanelStyle";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle";
import store from "@/store";

export default defineComponent({
  name: "TextColorStyle",
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const show = ref(true);
    const name = "color";

    const colorPickerStyleRef = ref();

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );

    const color = ref({
      hex8: focusedElement.value?.attributes?.style?.value[name],
    });

    watch(color, (newVal: object) => {
      if (focusedElement.value?.attributes?.style?.value[name]) {
        focusedElement.value.attributes.style.value[name] = newVal.hex8;
        store.commit(
          "canvas/UPDATE_FOCUSED_JSON_AND_DOM",
          focusedElement.value
        );
      }
    });

    watch(focusedElement, (newVal) => {
      colorPickerStyleRef.value.updateColor(color.value);
      color.value.hex8 = newVal.attributes?.style?.value[name];
    });

    const updateColor = (newVal) => {
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
