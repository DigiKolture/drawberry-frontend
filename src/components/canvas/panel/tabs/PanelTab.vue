<template>
  <section class="panel__tab">
    <div
      @click="setActiveTab"
      @dblclick="closeAllTabs"
      class="panel__tab__head"
    >
      <h5>{{ properties.title }}</h5>
      <BaseIcon :icon="`canvas/panel/tab/${showBody ? 'open' : 'close'}`" />
    </div>
    <div v-if="showBody" class="panel__tab__body">
      <slot />
    </div>
  </section>
</template>
<script>
import { defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";

export default defineComponent({
  name: "PanelTab",
  components: { BaseIcon },
  props: {
    properties: {
      type: Object,
      required: true,
    },
    showBody: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, { emit }) {
    const open = ref(false);

    const toggle = () => {
      open.value = !open.value;
    };

    const setActiveTab = () => {
      emit("update", props.properties.index);
    };

    const closeAllTabs = () => {
      emit("close_tabs");
    };

    return {
      open,
      setActiveTab,
      closeAllTabs,
    };
  },
});
</script>
