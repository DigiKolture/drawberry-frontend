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
import { modifiers } from "@/composables/canvas/panel/modifiers";

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
    const { updateAttribute } = modifiers();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedChildrenElements = computed(
      () => store.getters["canvas/focusedChildrenElements"]
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

    const getTargetElement = () =>
      props.childId
        ? focusedChildrenElements.value[props.childIndex]
        : focusedElement.value;

    const align = ref(getTargetElement().attributes[name].value);

    watch(align, (newVal: string) => {
      updateAttribute(name, newVal, props.childIndex);
    });

    // watch(focusedElement, (newVal) => {
    //   if (!props.isParent) {
    //     align.value = newVal.attributes[name].value;
    //   }
    // });
    //
    // watch(focusedParentElement, (newVal) => {
    //   if (props.isParent) {
    //     align.value = newVal.attributes[name].value;
    //   }
    // });

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
