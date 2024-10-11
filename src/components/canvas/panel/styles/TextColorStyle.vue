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
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import { ColorPickerTypes } from "@/store/modules/modals/types";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "TextColorStyle",
  computed: {
    ColorPickerTypes() {
      return ColorPickerTypes;
    },
  },
  props: {
    childId: {
      type: String,
      default: "",
      required: false,
    },
    childIndex: {
      type: Number,
      default: -1,
      required: false,
    },
  },
  components: { ColorPickerStyle, PanelStyle },
  setup(props) {
    const name = "color";
    const { modifier } = modifiersUpdater(props, name);

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
      show,
      color,
      colorPickerStyleRef,
      updateColor,
    };
  },
});
</script>
