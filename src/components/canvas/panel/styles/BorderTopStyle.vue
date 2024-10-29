<template>
  <PanelStyle :modifier="name" title="Border top">
    <BaseBorderStyle :model-value="border" @update:model-value="updateBorder" />
  </PanelStyle>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { styles } from "@/composables/canvas/styles";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import BaseBorderStyle from "@/components/canvas/panel/styles/resusables/BaseBorderStyle.vue";

export default defineComponent({
  name: "BorderTopStyle",
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
  components: { BaseBorderStyle, PanelStyle },

  setup(props) {
    const name = "border-top";
    const unit = "px";

    const { parseBorder } = styles();
    const { modifier } = modifiersUpdater(props, name);

    const border = reactive(parseBorder(modifier.value));

    // Handle updates from child component
    const updateBorder = (newVal: any) => {
      Object.assign(border, newVal);
    };

    // Watch border changes to update modifier
    watch(
      () => ({ ...border }), // Create a new reference to detect deep changes
      (newVal) => {
        modifier.value = `${newVal.width}${unit} ${newVal.style} ${newVal.color.hex8}`;
      },
      { deep: true }
    );

    // Watch modifier changes to update border
    watch(
      () => modifier.value,
      (newVal) => {
        const parsedBorder = parseBorder(newVal);
        Object.assign(border, parsedBorder);
      }
    );

    return {
      name,
      border,
      updateBorder,
    };
  },
});
</script>
