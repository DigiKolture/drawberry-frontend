<template>
  <section :id="modifier" class="panel__style">
    <div v-if="title" class="panel__style__head">
      <h5>{{ title }}</h5>
    </div>
    <div class="panel__style__body">
      <slot />
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PanelStyle",
  props: {
    modifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
  },
});
</script>
