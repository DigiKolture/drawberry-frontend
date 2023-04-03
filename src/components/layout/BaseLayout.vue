<template>
  <div class="base">
    <Header />

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "./Header.vue";

export default defineComponent({
  name: "BaseLayout",
  // eslint-disable-next-line vue/no-unused-components
  components: { Header },
});
</script>

<style></style>
