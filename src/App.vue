<template>
  <router-view />
  <ToastMessage />
</template>

<style lang="scss"></style>
<script setup lang="ts">
import store from "@/store";

import ToastMessage from "@/components/helpers/ToastMessage.vue";
import { onMounted } from "vue";

onMounted(() => {
  store.commit("toast/HIDE_TOAST");
});
</script>
