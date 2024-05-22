<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "AuthCallback",

  async mounted() {
    await store.dispatch("auth/oAuthLogin");

    router.push("/projects");
  },
});
</script>
