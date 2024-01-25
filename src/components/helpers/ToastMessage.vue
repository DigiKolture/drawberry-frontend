<template>
  <div class="toast__message" v-if="visible" :class="type">
    <div>
      <BaseIcon :icon="`toast/${type}`" />
      <h6>{{ message }}</h6>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "ToastMessage",
  components: { BaseIcon },

  setup() {
    const visible = computed(() => {
      return store.getters["toast/visible"];
    });
    const message = computed(() => {
      return store.getters["toast/message"];
    });
    const type = computed(() => {
      return store.getters["toast/type"];
    });

    return {
      visible,
      message,
      type,
    };
  },
});
</script>

<style scoped></style>
