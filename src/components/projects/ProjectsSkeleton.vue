<template>
  <div class="projects__skeletons">
    <div v-for="i in 6" :key="i" class="projects__skeletons__item">
      <div class="projects__skeletons__item__img"></div>
      <div class="projects__skeletons__item__title"></div>
      <div class="projects__skeletons__item__desc"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProjectsSkeleton",
});
</script>

<style></style>
