<template>
  <PanelStyle title="Background Image">
    <div class="content__style">
      <PanelStyleTabs @update="updateTab" :titles="titles">
        <BaseMediaImageUpload
          v-model="src"
          @update="updateImage"
          v-if="activeIndex === 0"
        />
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
import { computed, defineComponent, ref } from "vue";
import store from "@/store";
import PanelStyleTabs from "@/components/canvas/panel/PanelStyleTabs.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { helpers } from "@/composables/helpers";
import BaseMediaImageUpload from "@/components/canvas/panel/BaseMediaImageUpload.vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
export default defineComponent({
  name: "SidebarBackgroundImageStyle",
  components: {
    PanelStyle,
    BaseMediaImageUpload,
    BaseButtonIcon,
    PanelStyleTabs,
  },

  setup() {
    const titles = ["Upload", "Url"];
    const { isValidImageUrl } = helpers();

    const style = computed(() => {
      return store.getters["canvas/style"];
    });
    let activeIndex = ref(0);

    const src = ref(style.value.backgroundImage);

    const updateTab = (index: number) => {
      activeIndex.value = index;
    };

    const updateImage = async () => {
      const isValid = await isValidImageUrl(src.value);
      if (!isValid && src.value) return;
      style.value.backgroundImage = src.value;
      await store.dispatch("canvas/updateProjectStyle", style.value);
    };

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
