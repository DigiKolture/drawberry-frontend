<template>
  <div class="projects-dropdown">
    <button :key="key" v-for="(dropdown, key) in data">
      <span><BaseIcon :icon="dropdown.icon" /></span>
      <span>{{ dropdown.name }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
export default defineComponent({
  name: "ProjectDropdownLayout",
  components: { BaseIcon },

  props: {
    data: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style></style>
