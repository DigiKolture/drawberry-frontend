<template>
  <PanelStyle title="Line height">
    <div class="font__size__style">
      <input v-model="model" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "LineHeightStyle",
  components: { PanelStyle },

  setup() {
    const name = "font-model";
    const unit = "px";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const model = ref(
      focusedElement.value.attributes.style.value[name]?.slice(0, -2)
    );
    let modelWithUnit = ref(focusedElement.value.attributes.style.value[name]);

    watch(model, (newVal: string | number) => {
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        modelWithUnit.value = newVal;
      } else {
        modelWithUnit.value = newVal + unit;
      }
      focusedElement.value.attributes.style.value[name] = modelWithUnit.value;
      store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      model.value = newVal.attributes.style.value[name].slice(0, -2);
      modelWithUnit.value = newVal.attributes.style.value[name];
    });

    return {
      focusedElement,
      model,
      name,
    };
  },
});
</script>
