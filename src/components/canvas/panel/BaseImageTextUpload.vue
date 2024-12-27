<template>
  <PanelStyleTabs @update="updateTab" :titles="titles">
    <BaseMediaImageUpload
      v-model="src"
      @update="updateImage"
      v-if="activeIndex === 0"
    />
    <div v-if="activeIndex === 1" class="content__style__media__text">
      <div class="content__style__input__group">
        <input
          v-model="src"
          type="url"
          :class="{
            focus: isInputFocused,
            not_focused: !isInputFocused,
            invalid: invalidURL,
          }"
          ref="inputField"
          @focus="focus"
          @click="focus"
          @blur="blur"
          @input="input"
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
      <p v-if="invalidURL" :class="{ invalid: invalidURL }">
        Enter a valid URL of an image
      </p>
    </div>
  </PanelStyleTabs>
</template>
<script>
import { computed, defineComponent, onMounted, ref, watch } from "vue";
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
    const invalidURL = ref(false);

    const inputField = ref(null);

    onMounted(() => {
      src.value = props.modelValue;
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        src.value = newVal;
      }
    );

    const updateTab = (index) => {
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

    const focus = () => {
      isInputFocused.value = true;
    };

    const input = () => {
      isInputFocused.value = true;
      invalidURL.value = false;
    };
    const blur = () => {
      isInputFocused.value = false;
    };
    const updateImage = async () => {
      if (inputField.value) inputField.value.blur();
      const isValid = await isValidImageUrl(src.value);
      isInputFocused.value = false;
      if (!isValid && src.value) {
        invalidURL.value = true;
        return;
      }
      emit("update:modelValue", src.value);
      emit("confirm", src.value);
    };

    return {
      src,
      titles,
      inputField,
      invalidURL,
      activeIndex,
      isInputFocused,
      updateTab,
      blur,
      focus,
      input,
      updateImage,
      clearLink,
      showUpdateButton,
    };
  },
});
</script>
