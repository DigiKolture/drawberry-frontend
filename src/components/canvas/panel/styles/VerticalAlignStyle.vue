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
  props: {
    isParent: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  setup(props) {
    const name = "valign";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedParentElement = computed(() => {
      return store.getters["canvas/focusedParentElement"];
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

    const align = ref(
      !props.isParent
        ? focusedElement.value.attributes[name].value
        : focusedParentElement.value.attributes[name].value
    );

    watch(align, (newVal: string) => {
      if (!props.isParent) {
        focusedElement.value.attributes[name].value = newVal;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedParentElement.value.attributes[name].value = newVal;
        store.dispatch(
          "canvas/updateFocusedParentElement",
          focusedParentElement.value
        );
      }
    });

    watch(focusedElement, (newVal) => {
      if (!props.isParent) {
        align.value = newVal.attributes[name].value;
      }
    });

    watch(focusedParentElement, (newVal) => {
      if (props.isParent) {
        align.value = newVal.attributes[name].value;
      }
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
