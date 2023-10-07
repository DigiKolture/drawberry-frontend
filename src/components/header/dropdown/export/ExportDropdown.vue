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
        <BaseButton
          @click="openManage"
          class="button__outline"
          title="Manage apps"
        />
      </div>
    </div>
    <div class="export__esps" v-else>
      <div class="export__esps__header">
        <h5>Connected apps</h5>
        <button @click="openManage"><BaseIcon icon="settings" /></button>
      </div>
      <div class="export__esps__lists">
        <ExportESPsList />
        <ActionDropdownItem
          @click="openManage"
          class="export__esps__lists__add"
          title="Add new app"
          icon="add"
          subtitle="5+ apps to integrate with"
        />
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
import ExportESPsList from "@/components/header/dropdown/export/ExportESPsList.vue";
import { helpers } from "@/composables/helpers";

export default defineComponent({
  name: "ExportDropdown",
  components: { ExportESPsList, ActionDropdownItem, BaseButton, BaseIcon },

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

    const { capitalizeFirstLetter } = helpers();

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

    const openManage = () => {
      store.commit("modals/OPEN_MODAL", "manage_esp");
    };

    return {
      callEvent,
      data,
      esps,
      capitalizeFirstLetter,
      isEspEmpty,
      openManage,
      downloadData,
    };
  },
});
</script>

<style></style>
