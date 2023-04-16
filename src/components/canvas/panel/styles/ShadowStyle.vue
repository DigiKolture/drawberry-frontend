<template>
  <PanelStyle title="Shadow">
    <div class="shadow__style">
      <div class="shadow__style__tab__item">
        <BaseSliderIcon
          v-model="shadow.y"
          icon="canvas/panel/styles/shadow/y"
        />
        <BaseSliderIcon
          v-model="shadow.x"
          icon="canvas/panel/styles/shadow/x"
        />
        <BaseSliderIcon
          v-model="shadow.blur"
          icon="canvas/panel/styles/shadow/blur"
        />
        <BaseSliderIcon
          v-model="shadow.spread"
          icon="canvas/panel/styles/shadow/spread"
        />
        <ColorPickerStyle
          @update-color="updateColor"
          :color="shadow.color"
          title="Color"
        />
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import { styles } from "@/composables/canvas/styles";
import store from "@/store";

export default defineComponent({
  name: "ShadowStyle",
  components: { ColorPickerStyle, BaseSliderIcon, PanelStyle },

  setup() {
    const name = "box-shadow";
    const unit = "px";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });
    const { parseBoxShadow } = styles();

    const shadow: any = reactive(
      parseBoxShadow(focusedElement.value.attributes.style.value[name])
    );

    const color = ref({
      hex8: shadow.color,
    });

    const updateColor = (newVal: any) => {
      shadow.color = newVal;
    };

    watch(shadow, (newVal) => {
      focusedElement.value.attributes.style.value[
        name
      ] = `${newVal.y}${unit} ${newVal.x}${unit} ${newVal.blur}${unit} ${newVal.spread}${unit} ${newVal.color.hex8}`;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    });

    return {
      shadow,
      color,
      updateColor,
    };
  },
});
</script>
