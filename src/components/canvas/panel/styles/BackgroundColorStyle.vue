<template>
  <PanelStyle :modifier="name" title="BACKGROUND COLOR">
    <ColorPickerStyle
      :type="ColorPickerTypes.PANEL_STYLE_BG_COLOR"
      v-model="color"
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
  name: "BackgroundColorStyle",
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
    const name = "background-color";
    const show = ref(true);
    const colorPickerStyleRef = ref();

    const { modifier } = modifiersUpdater(props, name);

    const color = ref({
      hex8: modifier.value,
    });

    watch(color, (newVal: any) => {
      modifier.value = newVal.hex8;
    });

    watch(modifier, (newVal: any) => {
      color.value.hex8 = newVal;
    });

    return {
      name,
      show,
      color,
      colorPickerStyleRef,
    };
  },
});
</script>
