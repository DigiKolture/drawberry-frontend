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

export default defineComponent({
  name: "FontWeightStyle",
  components: { PanelStyle },
  setup() {
    const name = "font-weight";

    const { getFontWeightsWithFamily } = fonts();

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );
    const weightOptions = getFontWeightsWithFamily(
      focusedElement.value.attributes.style.value["font-family"]
    );
    store.commit("canvas/SET_FONT_WEIGHTS", weightOptions);

    const weight = ref(focusedElement.value.attributes.style.value[name]);
    const fontWeights = computed(() => store.getters["canvas/fontWeights"]);

    watch(weight, (newVal: string | number) => {
      focusedElement.value.attributes.style.value[name] = newVal;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
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
