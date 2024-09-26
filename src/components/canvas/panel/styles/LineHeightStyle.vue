<template>
  <PanelStyle title="Line height">
    <div class="font__size__style">
      <input v-model="model" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";

export default defineComponent({
  name: "LineHeightStyle",
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
    const name = "line-height";
    const unit = "px";
    const { getTargetElement, updateStyle } = modifiers();

    const model = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]?.slice(0, -2)
    );
    let modelWithUnit = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );

    watch(model, (newVal: string | number) => {
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        modelWithUnit.value = newVal;
      } else {
        modelWithUnit.value = newVal + unit;
      }
      updateStyle(name, modelWithUnit.value, props.childIndex);
    });

    // watch(focusedElement, (newVal) => {
    //   model.value = newVal.attributes.style.value[name].slice(0, -2);
    //   modelWithUnit.value = newVal.attributes.style.value[name];
    // });

    return {
      model,
      name,
    };
  },
});
</script>
