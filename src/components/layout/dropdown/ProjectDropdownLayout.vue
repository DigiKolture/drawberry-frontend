<template>
  <div class="action-dropdown">
    <button
      class="action"
      @click="callEvent(dropdown)"
      :key="key"
      v-for="(dropdown, key) in data"
    >
      <span><BaseIcon :icon="dropdown.icon" /></span>
      <span class="name">{{ dropdown.name }}</span>
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

  setup(props, { emit }) {
    const callEvent = (dropdown: any) => {
      if (dropdown.event) emit("events", dropdown.event);
    };

    return {
      callEvent,
    };
  },
});
</script>

<style></style>
