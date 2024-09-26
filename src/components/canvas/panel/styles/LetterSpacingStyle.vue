<template>
  <PanelStyle title="Letter spacing">
    <div class="font__size__style">
      <input v-model="model" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { modifiers } from "@/composables/canvas/panel/modifiers";

export default defineComponent({
  name: "LetterSpacingStyle",
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
    const name = "letter-spacing";
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
