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
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle";
import BaseSliderIcon from "../BaseSliderIcon";
import store from "@/store";

export default defineComponent({
  name: "BorderRadiusStyle",
  components: { BaseSliderIcon, PanelStyle },

  setup() {
    const name = "border-radius";
    const unit = "px";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const radius = ref(
      focusedElement.value.attributes.style.value[name].slice(0, -2)
    );
    const radiusWithUnit = ref(
      focusedElement.value.attributes.style.value[name]
    );

    watch(radius, (newVal: string | number) => {
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        radiusWithUnit.value = newVal;
      } else {
        radiusWithUnit.value = newVal + unit;
      }
      focusedElement.value.attributes.style.value[name] = radiusWithUnit.value;
      store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      radius.value = newVal.attributes.style.value[name].slice(0, -2);
      radiusWithUnit.value = newVal.attributes.style.value[name];
    });

    return {
      radius,
      radiusWithUnit,
    };
  },
});
</script>
