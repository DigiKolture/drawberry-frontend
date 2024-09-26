<template>
  <PanelStyle :name="name" title="Size">
    <div class="font__size__style">
      <input v-model="size" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";

export default defineComponent({
  name: "FontSizeStyle",
  components: { PanelStyle },
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
    const name = "font-size";
    const unit = "px";

    const { getTargetElement, updateStyle } = modifiers();

    const size = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]?.slice(0, -2)
    );
    let sizeWithUnit = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );

    watch(size, (newVal: string | number) => {
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        sizeWithUnit.value = newVal;
      } else {
        sizeWithUnit.value = newVal + unit;
      }
      updateStyle(name, sizeWithUnit.value, props.childIndex);
    });

    // watch(focusedElement, (newVal) => {
    //   size.value = newVal.attributes.style.value[name].slice(0, -2);
    //   sizeWithUnit.value = newVal.attributes.style.value[name];
    // });

    return {
      size,
      name,
    };
  },
});
</script>
