<template>
  <PanelStyle title="IMAGE LINK">
    <div class="content__style">
      <PanelStyleTabs @update="updateTab" :titles="titles">
        <MediaImageUpload v-if="activeIndex === 0" />
        <div v-if="activeIndex === 1" class="content__style__media__text">
          <input v-model="src" type="url" required class="input__style__text" />
          <BaseButtonIcon
            @click="updateImage"
            type="submit"
            icon="canvas/panel/styles/media/update"
          />
        </div>
      </PanelStyleTabs>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import PanelStyleTabs from "@/components/canvas/panel/PanelStyleTabs.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { helpers } from "@/composables/helpers";
import MediaImageUpload from "@/components/canvas/panel/MediaImageUpload.vue";

export default defineComponent({
  name: "ImageAttribute",
  components: {
    MediaImageUpload,
    BaseButtonIcon,
    PanelStyleTabs,
    PanelStyle,
  },

  setup() {
    const name = "src";
    const titles = ["Upload", "Url"];
    const { isValidImageUrl } = helpers();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });
    let activeIndex = ref(0);

    const src = ref(focusedElement.value.attributes[name].value);

    const updateTab = (index: number) => {
      activeIndex.value = index;
    };

    const updateImage = async () => {
      const isValid = await isValidImageUrl(src.value);
      if (!isValid) return;
      focusedElement.value.attributes[name].value = src.value;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    };

    watch(focusedElement, (newVal) => {
      src.value = newVal.attributes[name].value;
    });

    return {
      activeIndex,
      src,
      titles,
      updateTab,
      updateImage,
    };
  },
});
</script>
