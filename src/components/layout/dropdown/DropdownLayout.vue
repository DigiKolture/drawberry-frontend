<template>
  <div class="action-dropdown">
    <div
      class="action"
      @click="callEvent(dropdown)"
      :key="key"
      v-for="(dropdown, key) in data"
    >
      <span class="action__icon"><BaseIcon :icon="dropdown.icon" /></span>
      <div class="action__titles">
        <span class="name">{{ dropdown.name }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
export default defineComponent({
  name: "DropdownLayout",
  components: { BaseIcon },

  props: {
    data: {
      type: Array,
      required: true,
    },
  },

  setup(props, { emit }) {
    const callEvent = (dropdown: any) => {
      if (dropdown.event) emit("clicks", dropdown.event);
    };

    return {
      callEvent,
    };
  },
});
</script>

<style></style>
