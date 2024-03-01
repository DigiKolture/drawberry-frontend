<template>
  <PanelStyle name="color" title="Text COLOR">
    <ColorPickerStyle
      :type="ColorPickerTypes.PANEL_STYLE_TEXT_COLOR"
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import store from "@/store";
import { ColorPickerTypes } from "@/store/modules/modals/types";

export default defineComponent({
  name: "TextColorStyle",
  computed: {
    ColorPickerTypes() {
      return ColorPickerTypes;
    },
  },
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const show = ref(true);
    const name = "color";

    const colorPickerStyleRef = ref();

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );

    const color = ref({
      hex8: focusedElement.value.attributes.style.value[name],
    });

    watch(color, (newVal: any) => {
      focusedElement.value.attributes.style.value[name] = newVal.hex8;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      colorPickerStyleRef.value.updateColor(color.value);
      color.value.hex8 = newVal.attributes.style.value[name];
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
