<template>
  <PanelStyle title="Horizontal Align">
    <div class="align__style">
      <BaseButtonIcon
        :key="key"
        v-for="(option, key) in alignOptions"
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
import { HistoryActionTypes } from "@/store/modules/history/types";

export default defineComponent({
  name: "HorizontalAlignStyle",
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
    const name = "align";
    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_ATTRIBUTE
    );

    const alignOptions = [
      {
        icon: "canvas/panel/styles/horizontal-align/left",
        align: "left",
      },
      {
        icon: "canvas/panel/styles/horizontal-align/center",
        align: "center",
      },
      {
        icon: "canvas/panel/styles/horizontal-align/right",
        align: "right",
      },
    ];

    const changeAlignment = (option: string) => {
      modifier.value = option;
    };

    return {
      alignOptions,
      modifier,
      changeAlignment,
    };
  },
});
</script>
