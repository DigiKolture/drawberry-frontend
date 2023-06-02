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
    const name = "background-color";

    const colorPickerStyleRef = ref();

    const bgColor = computed(() => {
      return store.getters["style/bgColor"];
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const color = ref({
      hex8: bgColor.value,
    });

    watch(color, (newVal: any) => {
      store.commit("style/SET_BG_COLOR", newVal.hex8);
      store.dispatch("canvas/updateProjectStyle", {
        projectId: project.value.id,
        style: {
          [name]: newVal.hex8,
        },
      });
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
