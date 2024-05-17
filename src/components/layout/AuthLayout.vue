<template>
  <BaseLayout>
    <section class="auth-layout">
      <slot />
      <div class="auth__terms__privacy">
        <a>Terms of use</a>
        <span>|</span>
        <a>Privacy policy</a>
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
