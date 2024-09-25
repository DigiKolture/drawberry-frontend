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

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedChildrenElements = computed(
      () => store.getters["canvas/focusedChildrenElements"]
    );

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

    const getTargetElement = () =>
      props.childId
        ? focusedChildrenElements.value[props.childIndex]
        : focusedElement.value;

    const align = ref(getTargetElement().attributes.style.value[name]);

    watch(align, (newVal: string) => {
      if (!props.childId) {
        focusedElement.value.attributes.style.value[name] = newVal;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedChildrenElements.value[props.childIndex].attributes.style.value[
          name
        ] = newVal;
        store.dispatch(
          "canvas/updateFocusedElement",
          focusedChildrenElements.value[props.childIndex]
        );
      }
    });

    // watch(focusedElement, (newVal) => {
    //   if (!props.isParent) {
    //     align.value = newVal.attributes.style.value[name];
    //   }
    // });
    //
    // watch(focusedParentElement, (newVal) => {
    //   if (props.isParent) {
    //     align.value = newVal.attributes.style.value[name];
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
