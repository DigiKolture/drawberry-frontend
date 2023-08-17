<template>
  <div class="header-export action__dropdown">
    <div class="export__empty" v-if="isEspEmpty">
      <div class="export__empty__icons">
        <div class="export__empty__icon" :key="key" v-for="(esp, key) in data">
          <BaseIcon :icon="esp.icon" />
        </div>
      </div>
      <div class="export__empty__content">
        <h6>No connected apps</h6>
        <p>You haven't let any apps access your account yet.</p>
        <BaseButton class="button__outline" title="Manage apps" />
      </div>
    </div>
    <div class="export__footer">
      <ActionDropdownItem
        :title="downloadData.name"
        :icon="downloadData.icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";
import BaseButton from "@/components/layout/BaseButton.vue";
import ActionDropdownItem from "@/components/dropdown/ActionDropdownItem.vue";

export default defineComponent({
  name: "ExportDropdown",
  components: { ActionDropdownItem, BaseButton, BaseIcon },

  setup(props, { emit }) {
    const downloadData = {
      icon: "header/export/download",
      name: "Download HTML",
    };
    const data = [
      {
        icon: "header/export/mailchimp",
        name: "Send to Mailchimp",
        esp: "mailchimp",
      },
      {
        icon: "header/export/google",
        name: "Send to Google",
        esp: "google",
      },
      {
        icon: "header/export/mailgun",
        name: "Send to Mailgun",
        esp: "mailgun",
      },
      {
        icon: "header/export/hubspot",
        name: "Send to Hubspot",
        esp: "hubspot",
      },
    ];

    onMounted(() => {
      store.dispatch("esp/getESPs");
    });

    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const isEspEmpty = computed(() => {
      return esps.value.length === 0;
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
      isEspEmpty,
      getESPDescription,
      handleExport,
      downloadData,
    };
  },
});
</script>

<style></style>
