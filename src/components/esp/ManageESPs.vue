<template>
  <div class="manage__esps active">
    <div class="manage__esps__header">
      <h4>Manage apps</h4>
      <BaseButtonIcon class="manage__esps__header__close" icon="close" />
    </div>
    <div class="manage__esps__list">
      <ESPListItem
        :key="key"
        v-for="(dropdown, key) in data"
        :title="dropdown.title"
        :esp="dropdown.esp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import ESPListItem from "@/components/esp/ESPListItem.vue";

export default defineComponent({
  name: "ManageESPs",
  components: { ESPListItem, BaseButtonIcon },
  setup() {
    const data = [
      {
        title: "Send to Mailchimp",
        esp: "mailchimp",
      },
      {
        title: "Send to Google",
        esp: "google",
      },
      {
        title: "Send to Hubspot",
        esp: "hubspot",
      },
      {
        title: "Send to Mailgun",
        esp: "mailgun",
      },
    ];

    return {
      data,
    };
  },
});
</script>

<style></style>
