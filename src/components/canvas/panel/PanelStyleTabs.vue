<template>
  <div class="panel__style__tabs">
    <div class="panel__style__tabs__head">
      <button
        :key="key"
        v-for="(title, key) in titles"
        @click="toggle(key)"
        :class="{ active: activeIndex === key }"
      >
        {{ title }}
      </button>
    </div>
    <div class="panel__style__tabs__body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "PanelStyleTabs",

  props: {
    titles: {
      type: Array,
      required: true,
    },
  },

  setup() {
    let activeIndex = ref(0);

    const toggle = (index: number) => {
      activeIndex.value = index;
    };

    return {
      activeIndex,
      toggle,
    };
  },
});
</script>

<style scoped></style>
