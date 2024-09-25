<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorPickerStyle
      :type="ColorPickerTypes.PANEL_STYLE_BG_COLOR"
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import store from "@/store";
import { ColorPickerTypes } from "@/store/modules/modals/types";

export default defineComponent({
  name: "BackgroundColorStyle",
  computed: {
    ColorPickerTypes() {
      return ColorPickerTypes;
    },
  },
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
  components: { ColorPickerStyle, PanelStyle },
  setup(props) {
    const show = ref(true);

    const name = "background-color";

    const colorPickerStyleRef = ref();

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );

    const focusedChildrenElements = computed(
      () => store.getters["canvas/focusedChildrenElements"]
    );

    const getTargetElement = () =>
      props.childId
        ? focusedChildrenElements.value[props.childIndex]
        : focusedElement.value;

    const color = ref({
      hex8: getTargetElement().attributes.style.value[name],
    });

    watch(color, (newVal: any) => {
      if (!props.childId) {
        focusedElement.value.attributes.style.value[name] = newVal.hex8;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedChildrenElements.value[props.childIndex].attributes.style.value[
          name
        ] = newVal.hex8;
        store.dispatch(
          "canvas/updateFocusedElement",
          focusedChildrenElements.value[props.childIndex]
        );
      }
    });

    // watch(focusedElement, (newVal) => {
    //   if (!props.isParent) {
    //     colorPickerStyleRef.value.updateColor(color.value);
    //     color.value.hex8 = newVal.attributes.style.value[name];
    //   }
    // });
    //
    // watch(focusedParentElement, (newVal) => {
    //   if (props.isParent) {
    //     colorPickerStyleRef.value.updateColor(color.value);
    //     color.value.hex8 = newVal.attributes.style.value[name];
    //   }
    // });

    const updateColor = (newVal: any) => {
      color.value = newVal;
    };

    return {
      show,
      color,
      colorPickerStyleRef,
      updateColor,
    };
  },
});
</script>
