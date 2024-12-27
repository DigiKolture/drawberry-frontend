<template>
  <PanelStyle :modifier="name" title="Border radius">
    <div class="border__radius__style">
      <BaseSliderIcon
        v-model="localValue"
        icon="canvas/panel/styles/border-radius"
      />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "BorderRadiusStyle",
  components: { BaseSliderIcon, PanelStyle },

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

  setup(props) {
    const name = "border-radius";
    const unit = "px";

    const { modifier } = modifiersUpdater(props, name);

    const localValue = ref(modifier.value?.slice(0, -2));

    watch(localValue, (newVal) => {
      modifier.value = `${newVal}${unit}`;
    });

    watch(modifier, (newVal) => {
      localValue.value = newVal?.slice(0, -2);
    });

    return {
      name,
      localValue,
    };
  },
});
</script>
