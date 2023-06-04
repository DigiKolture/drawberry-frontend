<template>
  <section class="panel__tab">
    <div class="panel__tab__head">
      <h5>{{ title }}</h5>
      <BaseIcon :icon="`canvas/panel/tab/${showBody ? 'open' : 'close'}`" />
    </div>
    <div v-if="showBody" class="panel__tab__body">
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
    showBody: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>
