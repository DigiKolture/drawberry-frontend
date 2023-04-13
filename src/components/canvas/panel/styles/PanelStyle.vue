<template>
  <section class="panel__style">
    <div class="panel__style__head">
      <h5>{{ title }}</h5>
    </div>
    <div class="panel__style__body">
      <slot />
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
  name: "PanelStyle",
  props: {
    name: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
});
</script>
