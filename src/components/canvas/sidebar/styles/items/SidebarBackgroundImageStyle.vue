<template>
  <PanelStyle title="Background Image">
    <div class="content__style">
      <BaseImageTextUpload v-model="src" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import store from "@/store";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
export default defineComponent({
  name: "SidebarBackgroundImageStyle",
  components: {
    BaseImageTextUpload,
    PanelStyle,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  setup() {
    const titles = ["Upload", "Url"];

    const style = computed(() => {
      return store.getters["canvas/style"];
    });
    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    const src = ref(style.value.backgroundImage);

    const updateTab = (index: number) => {
      activeIndex.value = index;
    };

    const updateImage = async () => {
      style.value.backgroundImage = src.value;
      await store.dispatch("canvas/updateProjectStyle", style.value);
      isInputFocused.value = false;
    };

    return {
      activeIndex,
      isInputFocused,
      src,
      titles,
      updateTab,
      updateImage,
    };
  },
});
</script>
