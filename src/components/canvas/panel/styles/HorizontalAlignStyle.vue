<template>
  <PanelStyle title="Horizontal Align">
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
  name: "HorizontalAlignStyle",
  components: { BaseButtonIcon, PanelStyle },

  setup() {
    const name = "align";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

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
