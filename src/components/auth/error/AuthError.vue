<template>
  <div class="auth__error" v-if="message">
    <BaseIcon icon="auth/error" />
    <span>{{ message }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "AuthError",
  components: { BaseIcon },
  props: {
    message: {
      type: String,
      default: "",
      required: false,
    },
  },
});
</script>

<style scoped></style>
