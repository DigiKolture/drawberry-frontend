<template>
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
        :class="{ focus: isInputFocused, not_focused: !isInputFocused }"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
        required
        class="input__style__text"
        placeholder="Enter Url"
      />
      <BaseButtonIcon
        v-if="showUpdateButton"
        @mousedown.prevent="updateImage"
        icon="canvas/panel/styles/media/update"
      />
      <BaseButtonIcon
        v-if="!isInputFocused && src"
        @click="clearLink"
        icon="canvas/panel/styles/media/cancel"
      />
    </div>
  </PanelStyleTabs>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import BaseMediaImageUpload from "@/components/canvas/panel/BaseMediaImageUpload.vue";
import PanelStyleTabs from "@/components/canvas/panel/PanelStyleTabs.vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { helpers } from "@/composables/helpers";

export default defineComponent({
  name: "BaseImageTextUpload",
  components: {
    BaseButtonIcon,
    PanelStyleTabs,
    BaseMediaImageUpload,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    hasSrc: {
      required: false,
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const titles = ["Upload", "Url"];
    const { isValidImageUrl } = helpers();

    const src = ref("");
    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    onMounted(() => {
      src.value = props.modelValue;
    });

    const updateTab = (index: number) => {
      activeIndex.value = index;
    };

    const clearLink = async () => {
      src.value = "";
    };

    const showUpdateButton = computed(() => {
      if (props.hasSrc) {
        return isInputFocused.value && src.value;
      }
      return isInputFocused.value;
    });

    const updateImage = async () => {
      const isValid = await isValidImageUrl(src.value);
      if (!isValid && src.value) return;
      emit("update:modelValue", src.value);
      emit("confirm", src.value);
      isInputFocused.value = false;
    };

    return {
      src,
      titles,
      activeIndex,
      isInputFocused,
      updateTab,
      updateImage,
      clearLink,
      showUpdateButton,
    };
  },
});
</script>
