<template>
  <PanelStyle :modifier="`general-${name}`" title="BACKGROUND COLOR">
    <ColorPickerStyle
      :type="ColorPickerTypes.GENERAL_STYLE_BG_COLOR"
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import { ColorPickerTypes } from "@/store/modules/modals/types";
import { generalStyleUpdater } from "@/composables/canvas/modifiers/general-style-updater";

export default defineComponent({
  name: "SidebarBackgroundColorStyle",
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const name = "backgroundColor";
    const { modifier } = generalStyleUpdater(name);
    const show = ref(true);
    const colorPickerStyleRef = ref();

    const color = ref({
      hex8: modifier.value,
    });

    watch(color, (newVal: any) => {
      modifier.value = newVal.hex8;
    });

    watch(modifier, (newVal: any) => {
      color.value.hex8 = newVal;
    });

    const updateColor = (newVal: any) => {
      color.value = newVal;
    };
    return {
      name,
      show,
      ColorPickerTypes,
      color,
      colorPickerStyleRef,
      updateColor,
    };
  },
});
</script>
