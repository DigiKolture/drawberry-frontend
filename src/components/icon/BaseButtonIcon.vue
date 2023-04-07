<template>
  <button class="button__icon">
    <BaseIcon :icon="icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "BaseButtonIcon",
  components: { BaseIcon },
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped></style>
