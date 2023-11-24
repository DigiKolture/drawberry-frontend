<template>
  <PanelStyle title="IMAGE LINK">
    <div class="content__style">
      <PanelStyleTabs @update="updateTab" :titles="titles">
        <BaseMediaImageUpload
          v-model="src"
          @update="updateImage"
          v-if="activeIndex === 0"
        />
        <div v-if="activeIndex === 1" class="content__style__media__text">
          <input
            v-model="src"
            type="url"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            required
            class="input__style__text"
          />
          <BaseButtonIcon
            v-if="isInputFocused"
            @click="updateImage"
            icon="canvas/panel/styles/media/update"
          />
          <BaseButtonIcon
            v-if="!isInputFocused && src"
            @click="clearLink"
            icon="canvas/panel/styles/media/cancel"
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
import BaseMediaImageUpload from "@/components/canvas/panel/BaseMediaImageUpload.vue";
//TODO Split Image Components
export default defineComponent({
  name: "ImageAttribute",
  components: {
    BaseMediaImageUpload,
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
    const isInputFocused = ref(false);

    const src = ref(focusedElement.value.attributes[name].value);

    const updateTab = (index: number) => {
      activeIndex.value = index;
    };

    const updateImage = async () => {
      const isValid = await isValidImageUrl(src.value);
      if (!isValid) return;
      focusedElement.value.attributes[name].value = src.value;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      isInputFocused.value = false;
    };

    const clearLink = async () => {
      src.value = "";
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
      clearLink,
      isInputFocused,
    };
  },
});
</script>
