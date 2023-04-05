<template>
  <section class="panel__tab">
    <div class="panel__tab__head">
      <h5>{{ title }}</h5>
      <BaseIcon icon="canvas/panel/tab/open" />
    </div>
    <div class="panel__tab__body">
      <slot />
    </div>
  </section>
</template>
<script>
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";

export default defineComponent({
  name: "PanelTab",
  components: { BaseIcon },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
});
</script>
