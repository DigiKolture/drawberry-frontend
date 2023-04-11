<template>
  <PanelStyle name="font-weight" title="Weight">
    <div class="font__weight__style">
      <select v-model="weight" class="canvas__select">
        <option
          :key="key"
          v-for="(weight, key) in weightOptions"
          :value="weight"
        >
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

export default defineComponent({
  name: "FontWeightStyle",
  components: { PanelStyle },
  setup() {
    const name = "font-weight";
    const weightOptions = [200, 300, 400, 500, 600, 700, 800];

    const focusedElement = computed(
      () => store.getters["canvas/focusedElement"]
    );
    const weight = ref(focusedElement.value?.attributes?.style?.value[name]);

    watch(weight, (newVal: string | number) => {
      if (focusedElement.value?.attributes?.style?.value[name]) {
        focusedElement.value.attributes.style.value[name] = newVal;
        store.commit(
          "canvas/UPDATE_FOCUSED_JSON_AND_DOM",
          focusedElement.value
        );
      }
    });

    watch(focusedElement, (newVal) => {
      weight.value = newVal.attributes?.style?.value[name];
    });

    return {
      weight,
      weightOptions,
    };
  },
});
</script>
