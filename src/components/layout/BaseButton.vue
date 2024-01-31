<template>
  <button :disabled="disabled" class="button">
    <span v-if="!disabled">{{ title }}</span>
    <BaseIcon v-else class="loader" icon="loader" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "BaseButton",
  components: { BaseIcon },
  props: {
    title: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
});
</script>

<style scoped>
input {
}
</style>
