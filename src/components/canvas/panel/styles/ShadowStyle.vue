<template>
  <PanelStyle :modifier="name" title="Shadow">
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
          :type="ColorPickerTypes.PANEL_BOX_SHADOW_COLOR"
          @update-color="updateColor"
          :color="shadow.color"
          title="Color"
        />
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import { styles } from "@/composables/canvas/styles";
import { ColorPickerTypes } from "@/store/modules/modals/types";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "ShadowStyle",
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
  components: { ColorPickerStyle, BaseSliderIcon, PanelStyle },

  setup(props) {
    const name = "box-shadow";
    const unit = "px";

    const { parseBoxShadow } = styles();
    const { modifier } = modifiersUpdater(props, name);

    let shadow: any = reactive(parseBoxShadow(modifier.value));

    const color = ref({
      hex8: shadow.color,
    });

    const updateColor = (newVal: any) => {
      shadow.color = newVal;
    };

    watch(shadow, (newVal) => {
      modifier.value = `${newVal.y}${unit} ${newVal.x}${unit} ${newVal.blur}${unit} ${newVal.spread}${unit} ${newVal.color.hex8}`;
    });

    watch(modifier, (newVal) => {
      const parsedShadow = parseBoxShadow(newVal);
      Object.assign(shadow, parsedShadow);
    });

    return {
      name,
      shadow,
      ColorPickerTypes,
      color,
      updateColor,
    };
  },
});
</script>
