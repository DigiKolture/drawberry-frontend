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
        <p v-if="dropdown.esp" class="desc">
          {{ getESPDescription(dropdown) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
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
      },
      {
        icon: "header/export/netcore",
        name: "Send to Google",
        esp: "google",
      },
    ];

    onMounted(() => {
      store.dispatch("esp/getESPs");
    });

    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const callEvent = (dropdown: any) => {
      if (dropdown.event) emit("events", dropdown.event);
    };

    const checkESPForUser = (dropdown: any) => {
      return esps.value.find((esp: any) => esp.esp === dropdown.esp);
    };

    const handleExport = (dropdown: any) => {
      if (!dropdown.esp) return;
      if (checkESPForUser(dropdown)) return;
      store.dispatch("esp/getESPRedirectURL", dropdown.esp);
    };

    const getESPDescription = (dropdown: any) => {
      let desc = "";
      if (!dropdown.esp) return desc;
      if (checkESPForUser(dropdown)) {
        desc = "App integration connected";
      } else {
        desc = "App integration needed";
      }
      return desc;
    };

    return {
      callEvent,
      data,
      getESPDescription,
      handleExport,
    };
  },
});
</script>

<style></style>
