<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorPickerStyle
      ref="colorPickerStyleRef"
      :color="color"
      @update-color="updateColor"
    />
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "SidebarBackgroundColorStyle",
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const show = ref(true);

    const colorPickerStyleRef = ref();

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const color = ref({
      hex8: style.value.backgroundColor,
    });

    watch(color, (newVal: any) => {
      style.value.backgroundColor = newVal.hex8;
      store.dispatch("canvas/updateProjectStyle", style.value).then();
    });

    const updateColor = (newVal: any) => {
      color.value = newVal;
    };
    return {
      show,
      color,
      colorPickerStyleRef,
      updateColor,
    };
  },
});
</script>
