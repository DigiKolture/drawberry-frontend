<template>
  <div id="modals" class="modal" :class="{ open: open }">
    <div class="modal__header">
      <button id="modals-trigger" @click="close" class="modal__header__close">
        <BaseIcon icon="close" />
      </button>
      <div class="modal__heading">
        <slot name="heading" />
      </div>
    </div>
    <slot name="body" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "ModalLayout",
  props: {
    open: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: { BaseIcon },
  setup(_, { emit }) {
    const close = () => {
      emit("close");
    };

    return { close };
  },
});
</script>

<style></style>
