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
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";

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

    const {
      getTargetElement,
      updateStyle,
      focusedElement,
      focusedChildrenElements,
    } = modifiers();

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

    const align = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );

    let ignoreModifierWatcher = false;

    watch(align, (newVal: string) => {
      updateStyle(name, newVal, props.childIndex);
    });

    watch(focusedChildrenElements.value, (newVal) => {
      if (props.childId) {
        align.value = newVal[props.childIndex].attributes.style.value[name];
      }
    });

    watch(focusedElement.value, (newVal) => {
      if (!props.childId) {
        align.value = newVal.attributes.style.value[name];
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
