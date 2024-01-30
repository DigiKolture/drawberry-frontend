<template>
  <div class="action__dropdown__item">
    <div class="action__dropdown__item__icon"><BaseIcon :icon="icon" /></div>
    <div class="action__dropdown__item__titles">
      <h5 class="dropdown__item__titles__name">{{ title }}</h5>
      <p v-if="subtitle" class="dropdown__item__titles__desc">
        {{ subtitle }}
      </p>
    </div>
    <BaseIcon
      v-if="disabled && (current === type || !type)"
      class="action__dropdown__item__loader"
      icon="loader"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "ActionDropdownItem",
  components: { BaseIcon },
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: null,
    },
    current: {
      type: String,
      required: false,
      default: null,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    subtitle: {
      type: String,
      required: false,
      default: null,
    },
  },
});
</script>

<style></style>
