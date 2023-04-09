<template>
  <PanelStyle :name="name" title="Size">
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

    let size = ref(focusedElement.value.attributes?.style?.value[name]?.value);

    watch(focusedElement, (newVal) => {
      size.value = newVal.attributes?.style?.value[name]?.value;
    });

    watch(size, (newVal) => {
      if (focusedElement.value.attributes?.style?.value[name]?.value) {
        focusedElement.value.attributes.style.value[name].value = newVal;
        store.commit("canvas/SET_FOCUSED_ELEMENT", focusedElement.value);
      }
    });

    return {
      focusedElement,
      size,
      name,
    };
  },
});
</script>
