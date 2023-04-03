<template>
  <div class="base">
    <Header />

    <main class="main auth">
      <section class="auth">
        <slot />
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "./Header.vue";

export default defineComponent({
  name: "BaseLayout",
  components: { Header },
});
</script>

<style></style>
