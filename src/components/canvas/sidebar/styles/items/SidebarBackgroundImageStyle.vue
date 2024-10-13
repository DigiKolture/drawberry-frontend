<template>
  <PanelStyle title="Background Image">
    <div class="content__style">
      <BaseImageTextUpload
        v-model="modifier"
        :has-src="false"
        @confirm="updateImage"
      />
    </div>
  </PanelStyle>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
import { generalStyleUpdater } from "@/composables/canvas/modifiers/general-style-updater";

export default defineComponent({
  name: "SidebarBackgroundImageStyle",
  components: {
    BaseImageTextUpload,
    PanelStyle,
  },
  setup() {
    const titles = ["Upload", "Url"];
    const name = "backgroundImage";
    const { modifier } = generalStyleUpdater(name);
    const isInputFocused = ref(false);

    const updateImage = async () => {
      isInputFocused.value = false;
    };

    return {
      isInputFocused,
      titles,
      modifier,
      updateImage,
    };
  },
});
</script>
