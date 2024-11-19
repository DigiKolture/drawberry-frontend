<template>
  <div class="color__style">
    <div ref="colorDisplay" class="color__style__container">
      <h5>{{ title }}</h5>
      <h5>{{ hex8ToHex(localColor.hex8) }}</h5>
      <button
        id="modals-trigger"
        @click="toggle"
        class="selected__color"
        :style="{ background: localColor.hex8 }"
      ></button>
    </div>

    <BaseColorPicker
      :style="positionStyles"
      @cancel="close"
      v-model="localColor"
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
  modelValue: {
    type: Object,
    default: () => ({ hex8: "#FFFFFF" }),
  },
});

const emits = defineEmits(["update:modelValue", "toggle"]);

const show = computed(() => {
  return store.getters["modals/colorPicker"] === props.type;
});

// Create a local copy of `modelValue`
const localColor = ref({ ...props.modelValue });
const colorDisplay = ref(null);

// Watch for changes in `modelValue` and sync `localColor`
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal.hex8 !== localColor.value.hex8) {
      localColor.value = { ...newVal };
    }
  },
  { deep: true }
);

// Emit changes to `modelValue` only when `localColor` changes and is different
watch(
  localColor,
  (newVal) => {
    if (newVal.hex8 !== props.modelValue.hex8) {
      emits("update:modelValue", newVal);
    }
  },
  { deep: true }
);

const screenHeight = ref(window.innerHeight);
const positionStyles = computed(() => {
  return {
    top: `${screenHeight.value}px`,
  };
});

const updateScreenHeight = () => {
  const height = window.innerHeight;
  if (!colorDisplay.value) return;
  const pickerHeight = 380; //Approx height of color picker
  const offsetTop = colorDisplay.value.offsetTop;
  const offsetFromBottom = height - offsetTop;

  if (offsetFromBottom > pickerHeight) {
    screenHeight.value = offsetTop + 40 + 10; //40 is the color picker display height
  } else if (offsetTop < pickerHeight) {
    screenHeight.value = 40;
  } else {
    // If we have enough space to show the picker above the color display
    screenHeight.value = height - offsetFromBottom - pickerHeight;
  }
};

onMounted(() => {
  updateScreenHeight();
  window.addEventListener("resize", updateScreenHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenHeight);
});

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
</script>
