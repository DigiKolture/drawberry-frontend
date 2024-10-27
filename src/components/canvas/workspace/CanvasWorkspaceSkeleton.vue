<template>
  <div class="canvas__workspace__skeleton__container">
    <div class="canvas__workspace__skeleton">
      <p>Loading project, please wait...</p>

      <div class="canvas__workspace__skeleton__items">
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CanvasWorkspaceSkeleton",
});
</script>
