<template>
  <div class="color__style">
    <div class="color__style__container">
      <h5>{{ title }}</h5>
      <h5>{{ hex8ToHex(colors.hex8) }}</h5>
      <button
        id="modals-trigger"
        @click="toggle"
        class="selected__color"
        :style="{
          background: colors.hex8,
        }"
      ></button>
    </div>

    <BaseColorPicker
      :style="positionStyles"
      @cancel="close"
      v-model="colors"
      v-if="show"
    />
  </div>
</template>

<script setup>
import {
  defineProps,
  defineEmits,
  ref,
  watch,
  defineExpose,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker.vue";
import store from "@/store";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "HEX",
  },
  color: {
    type: Object,
    default: null,
  },
});

const emits = defineEmits(["update-color", "toggle"]);

const show = computed(() => {
  return store.getters["modals/colorPicker"] === props.type;
});

const colors = ref({
  hex8: props.color?.hex8,
});

watch(colors, (newVal) => {
  emits("update-color", newVal);
});

const screenHeight = ref(window.innerHeight);
const positionStyles = computed(() => {
  return {
    top: `${screenHeight.value - 450}px`,
  };
});

const updateScreenHeight = () => {
  screenHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener("resize", updateScreenHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenHeight);
});

const updateColor = (newVal) => {
  colors.value = newVal;
};

const hex8ToHex = (hex8) => {
  return hex8.slice(0, 7).toUpperCase();
};

const toggle = () => {
  store.commit("modals/TOGGLE_STRING_MODAL", {
    modal: "color_picker",
    value: props.type,
  });
  emits("toggle");
};

const close = () => {
  store.commit("modals/CLOSE_MODAL", "color_picker");
};

defineExpose({ updateColor });
</script>
