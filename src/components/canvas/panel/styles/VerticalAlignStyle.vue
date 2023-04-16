<template>
  <PanelStyle title="Vertical Align">
    <div class="align__style">
      <BaseButtonIcon
        :key="key"
        v-for="(option, key) in alignOptions"
        :class="{ active: option.align === align }"
        :icon="option.icon"
        @click="changeAlignment(option.align)"
      />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "VerticalAlignStyle",
  components: { BaseButtonIcon, PanelStyle },
  setup() {
    const name = "valign";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

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

    const align = ref(focusedElement.value.attributes[name].value);

    watch(align, (newVal: string) => {
      focusedElement.value.attributes[name].value = newVal;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      align.value = newVal.attributes[name].value;
    });

    const changeAlignment = (option: string) => {
      align.value = option;
    };

    return {
      alignOptions,
      align,
      changeAlignment,
    };
  },
});
</script>
PanelTabs
