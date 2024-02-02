<template>
  <PanelStyle title="IMAGE LINK">
    <div class="content__style">
      <BaseImageTextUpload v-model="src" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
//TODO Split Image Components
export default defineComponent({
  name: "ImageAttribute",
  components: {
    BaseImageTextUpload,
    PanelStyle,
  },

  setup() {
    const name = "src";
    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });
    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    const src = ref(focusedElement.value.attributes[name].value);

    const updateImage = async () => {
      if (!src.value) return;
      focusedElement.value.attributes[name].value = src.value;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      isInputFocused.value = false;
    };

    watch(focusedElement, (newVal) => {
      src.value = newVal.attributes[name].value;
    });

    return {
      activeIndex,
      src,
      updateImage,
      isInputFocused,
    };
  },
});
</script>
