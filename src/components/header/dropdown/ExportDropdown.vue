<template>
  <div class="header-export action-dropdown">
    <div
      @click="handleExport(dropdown)"
      class="action"
      :key="key"
      v-for="(dropdown, key) in data"
    >
      <span class="action__icon"><BaseIcon :icon="dropdown.icon" /></span>
      <div class="action__titles">
        <h5 class="name">{{ dropdown.name }}</h5>
        <p v-if="dropdown.desc" class="desc">{{ dropdown.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "ExportDropdown",
  components: { BaseIcon },

  setup(props, { emit }) {
    const data = [
      {
        icon: "header/export/html",
        name: "Download HTML",
      },
      {
        icon: "header/export/mailchimp",
        name: "Send to Mailchimp",
        esp: "mailchimp",
        desc: "App integration needed",
      },
      {
        icon: "header/export/netcore",
        name: "Send to Google",
        esp: "google",
        desc: "App integration needed",
      },
    ];

    const callEvent = (dropdown: any) => {
      if (dropdown.event) emit("events", dropdown.event);
    };

    const handleExport = (dropdown: any) => {
      if (!dropdown.esp) return;

      store.dispatch("esp/getESPRedirectURL", dropdown.esp);
    };

    return {
      callEvent,
      data,
      handleExport,
    };
  },
});
</script>

<style></style>
