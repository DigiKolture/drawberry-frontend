<template>
  <PanelStyle :modifier="name" title="Text Align">
    <div class="align__style">
      <BaseButtonIcon
        v-for="option in alignOptions"
        :key="option.align"
        :class="{ active: option.align === modifier }"
        :icon="option.icon"
        @click="changeAlignment(option.align)"
      />
    </div>
  </PanelStyle>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "TextAlignStyle",
  components: { BaseButtonIcon, PanelStyle },
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
    const name = "text-align";
    const { modifier } = modifiersUpdater(props, name);

    const alignOptions = [
      { icon: "canvas/panel/styles/text-align/left", align: "left" },
      { icon: "canvas/panel/styles/text-align/center", align: "center" },
      { icon: "canvas/panel/styles/text-align/right", align: "right" },
    ];

    const changeAlignment = (option: string) => {
      modifier.value = option;
    };

    return {
      name,
      alignOptions,
      modifier,
      changeAlignment,
    };
  },
});
</script>
