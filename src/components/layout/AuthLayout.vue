<template>
  <BaseLayout>
    <section class="auth-layout">
      <slot />
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
