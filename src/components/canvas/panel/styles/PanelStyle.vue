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
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "PanelStyle",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
});
</script>
