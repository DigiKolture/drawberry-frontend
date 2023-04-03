<template>
  <BaseLayout>
    <section class="app__layout">
      <div class="app__container">
        <div class="app__header">
          <div class="app__content__container">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </div>
        </div>
        <div class="app__body">
          <div class="app__content__container">
            <slot />
          </div>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";

export default defineComponent({
  name: "AppLayout",
  components: { BaseLayout },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
});
</script>

<style></style>
