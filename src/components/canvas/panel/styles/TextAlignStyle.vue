<template>
  <PanelStyle title="Text Align">
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
  name: "TextAlignStyle",
  components: { BaseButtonIcon, PanelStyle },

  setup() {
    const name = "text-align";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const alignOptions = [
      {
        icon: "canvas/panel/styles/text-align/left",
        align: "left",
      },
      {
        icon: "canvas/panel/styles/text-align/center",
        align: "center",
      },
      {
        icon: "canvas/panel/styles/text-align/right",
        align: "right",
      },
    ];

    const align = ref(focusedElement.value.attributes.style.value[name]);

    watch(align, (newVal: string) => {
      focusedElement.value.attributes.style.value[name] = newVal;
      store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      align.value = newVal.attributes.style.value[name];
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
