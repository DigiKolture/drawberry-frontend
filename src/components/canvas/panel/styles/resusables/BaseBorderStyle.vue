<template>
  <div class="shadow__style">
    <div class="shadow__style__tab__item">
      <BaseSliderIcon
        v-model="localBorder.width"
        icon="canvas/panel/styles/border/top"
      />
      <ColorPickerStyle
        ref="colorPickerStyleRef"
        :type="ColorPickerTypes.PANEL_BORDER_TOP_COLOR"
        v-model="localBorder.color"
        title="Color"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from "vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import { ColorPickerTypes } from "@/store/modules/modals/types";
import BaseSliderIcon from "@/components/canvas/panel/BaseSliderIcon.vue";

export default defineComponent({
  name: "BaseBorderStyle",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseSliderIcon,
    ColorPickerStyle,
  },
  emits: ["update:modelValue"], // Important: declare the emit
  setup(props, { emit }) {
    const colorPickerStyleRef = ref();
    const localBorder = reactive({ ...props.modelValue });

    // Watch for prop changes
    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal) {
          Object.assign(localBorder, newVal);
        }
      },
      { deep: true }
    );

    // Watch local changes
    watch(
      () => ({ ...localBorder }), // Create a new reference to detect deep changes
      (newVal) => {
        emit("update:modelValue", newVal);
      },
      { deep: true }
    );

    return {
      ColorPickerTypes,
      colorPickerStyleRef,
      localBorder,
    };
  },
});
</script>
