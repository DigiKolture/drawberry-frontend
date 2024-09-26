<template>
  <PanelStyle title="Border radius">
    <div class="border__radius__style">
      <BaseSliderIcon
        v-model="radius"
        icon="canvas/panel/styles/border-radius"
      />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";

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

    const { getTargetElement, updateStyle } = modifiers();

    const radius = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ].slice(0, -2)
    );
    const radiusWithUnit = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );

    watch(radius, (newVal: string | number) => {
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        radiusWithUnit.value = newVal;
      } else {
        radiusWithUnit.value = newVal + unit;
      }
      updateStyle(name, radiusWithUnit.value, props.childIndex);
    });

    // watch(focusedElement, (newVal) => {
    //   radius.value = newVal.attributes.style.value[name].slice(0, -2);
    //   radiusWithUnit.value = newVal.attributes.style.value[name];
    // });

    return {
      radius,
      radiusWithUnit,
    };
  },
});
</script>
