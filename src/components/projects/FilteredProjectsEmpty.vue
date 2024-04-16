<template>
  <div v-if="searchName" class="projects__empty filtered">
    <h6>
      <span>“{{ searchName }}”</span> not found within projects
    </h6>
    <p>Try another search word</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FilteredProjectsEmpty",

  props: {
    searchName: {
      type: String,
      required: false,
      default: "",
    },
  },
});
</script>

<style></style>
