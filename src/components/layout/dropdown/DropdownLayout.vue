<template>
  <div id="modals" class="action__dropdown">
    <ActionDropdownItem
      @click="callEvent(dropdown)"
      :key="key"
      v-for="(dropdown, key) in data"
      :title="dropdown.name"
      :icon="dropdown.icon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ActionDropdownItem from "@/components/dropdown/ActionDropdownItem.vue";
export default defineComponent({
  name: "DropdownLayout",
  components: { ActionDropdownItem },

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
