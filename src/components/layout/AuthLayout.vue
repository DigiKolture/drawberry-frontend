<template>
  <BaseLayout>
    <section class="auth-layout">
      <slot />
      <div class="auth__terms__privacy">
        <a target="_blank" href="https://drawberry.io/privacy-and-terms"
          >Terms of use</a
        >
        <span>|</span>
        <a target="_blank" href="https://drawberry.io/privacy-and-terms#privacy"
          >Privacy policy</a
        >
      </div>
    </section>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";

export default defineComponent({
  name: "AuthLayout",
  components: { BaseLayout },
});
</script>

<style></style>
