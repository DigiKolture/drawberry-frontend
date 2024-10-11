<template>
  <PanelStyle name="font-weight" title="Weight">
    <div class="font__weight__style">
      <select v-model="modifier" class="canvas__select">
        <option :key="key" v-for="(weight, key) in fontWeights" :value="weight">
          {{ weight }}
        </option>
      </select>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

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

    const { getTargetElement } = modifiers();
    const { modifier } = modifiersUpdater(props, name);
    const { getFontWeightsWithFamily } = fonts();

    const weightOptions = getFontWeightsWithFamily(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        "font-family"
      ]
    );
    store.commit("canvas/SET_FONT_WEIGHTS", weightOptions);

    const fontWeights = computed(() => store.getters["canvas/fontWeights"]);

    return {
      modifier,
      fontWeights,
      weightOptions,
    };
  },
});
</script>
