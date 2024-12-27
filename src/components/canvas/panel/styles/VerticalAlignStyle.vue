<template>
  <PanelStyle :modifier="name" title="Vertical Align">
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
  name: "VerticalAlignStyle",
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
    const name = "valign";

    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_ATTRIBUTE
    );

    const alignOptions = [
      {
        icon: "canvas/panel/styles/vertical-align/top",
        align: "top",
      },
      {
        icon: "canvas/panel/styles/vertical-align/middle",
        align: "middle",
      },
      {
        icon: "canvas/panel/styles/vertical-align/bottom",
        align: "bottom",
      },
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
PanelTabs
