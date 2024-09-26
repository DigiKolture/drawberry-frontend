<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorPickerStyle
      :type="ColorPickerTypes.PANEL_STYLE_BG_COLOR"
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
import { modifiers } from "@/composables/canvas/panel/modifiers";

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
    const { getTargetElement, updateStyle } = modifiers();

    const name = "background-color";
    const show = ref(true);
    const colorPickerStyleRef = ref();

    const color = ref({
      hex8: getTargetElement(props.childId, props.childIndex).attributes.style
        .value[name],
    });

    watch(color, (newVal: any) => {
      updateStyle(name, newVal.hex8, props.childIndex);
    });

    // watch(focusedElement, (newVal) => {
    //   if (!props.isParent) {
    //     colorPickerStyleRef.value.updateColor(color.value);
    //     color.value.hex8 = newVal.attributes.style.value[name];
    //   }
    // });
    //
    // watch(focusedParentElement, (newVal) => {
    //   if (props.isParent) {
    //     colorPickerStyleRef.value.updateColor(color.value);
    //     color.value.hex8 = newVal.attributes.style.value[name];
    //   }
    // });

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
