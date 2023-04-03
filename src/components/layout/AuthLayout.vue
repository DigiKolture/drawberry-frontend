<template>
  <div class="base">
    <Header />

    <main class="main auth">
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import Header from "./Header.vue";

export default defineComponent({
  name: "BaseLayout",
  components: { Header },
});
</script>

<style></style>
