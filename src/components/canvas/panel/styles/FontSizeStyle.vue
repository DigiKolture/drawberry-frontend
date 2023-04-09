<template>
  <PanelStyle :name="name" title="Size">
    Size - {{ size }}
    <div class="font__size__style">
      <input v-model="size" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import store from "@/store";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";

export default defineComponent({
  name: "FontSizeStyle",
  components: { PanelStyle },
  setup() {
    const name = "font-size";
    const unit = "px";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    let size = ref(
      focusedElement.value.attributes?.style?.value[name].slice(0, -2)
    );
    let sizeWithUnit = ref(focusedElement.value.attributes?.style?.value[name]);

    watch(size, (newVal: string | number) => {
      if (focusedElement.value.attributes?.style?.value[name]) {
        if (typeof newVal === "string" && newVal.endsWith(unit)) {
          sizeWithUnit.value = newVal;
        } else {
          sizeWithUnit.value = newVal + unit;
        }
        focusedElement.value.attributes.style.value[name] = sizeWithUnit.value;
        store.commit("canvas/UPDATE_FOCUSED_ELEMENT", focusedElement.value);
      }
    });

    watch(focusedElement, (newVal) => {
      size.value = newVal.attributes?.style?.value[name].slice(0, -2);
      sizeWithUnit.value = newVal.attributes?.style?.value[name];
    });

    return {
      focusedElement,
      size,
      name,
    };
  },
});
</script>
