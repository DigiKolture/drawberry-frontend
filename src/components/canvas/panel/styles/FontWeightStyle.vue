<template>
  <PanelStyle name="font-weight" title="Weight">
    <div class="font__weight__style">
      <select v-model="weight" class="canvas__select">
        <option :key="key" v-for="(weight, key) in fontWeights" :value="weight">
          {{ weight }}
        </option>
      </select>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";
import { modifiers } from "@/composables/canvas/panel/modifiers";

export default defineComponent({
  name: "FontWeightStyle",
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
    const name = "font-weight";

    const { focusedElement, getTargetElement, updateStyle } = modifiers();

    const { getFontWeightsWithFamily } = fonts();

    const weightOptions = getFontWeightsWithFamily(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        "font-family"
      ]
    );
    store.commit("canvas/SET_FONT_WEIGHTS", weightOptions);

    const weight = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );
    const fontWeights = computed(() => store.getters["canvas/fontWeights"]);

    watch(weight, (newVal: string | number) => {
      updateStyle(name, newVal, props.childIndex);
    });

    watch(focusedElement.value, (newVal) => {
      weight.value = newVal.attributes.style.value[name];
    });

    return {
      weight,
      fontWeights,
      weightOptions,
    };
  },
});
</script>
