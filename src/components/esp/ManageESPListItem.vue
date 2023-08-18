<template>
  <div class="manage__esps__list__item">
    <div class="manage__esps__list__item__content">
      <div class="esps__list__item__icon">
        <BaseIcon :icon="`header/export/${esp}`" />
      </div>
      <div class="esps__list__item__titles">
        <h5 class="dropdown__item__titles__name">{{ title }}</h5>
        <p class="dropdown__item__titles__desc">{{ getESPSubTitle() }}</p>
      </div>
    </div>
    <div class="manage__esps__list__item__action">
      <BaseButton
        @click="handleExport"
        class="button__outline"
        :title="buttonText"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";

export default defineComponent({
  name: "ManageESPListItem",
  components: { BaseButton, BaseIcon },
  props: {
    title: {
      type: String,
      required: true,
    },
    esp: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: false,
    },
  },

  setup(props) {
    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const checkESPForUser = (esp: string) => {
      return esps.value.find((espItem: any) => espItem.esp === esp);
    };

    const handleExport = () => {
      // if (checkESPForUser(props.esp)) return;
      store.dispatch("esp/getESPRedirectURL", props.esp);
    };

    const getESPSubTitle = () => {
      let desc = "";
      if (checkESPForUser(props.esp)) {
        desc = "App integration connected";
      } else {
        desc = "Not connected";
      }
      return desc;
    };

    const buttonText = computed(() => {
      return checkESPForUser(props.esp) ? "Reconnect" : "Connect";
    });

    return {
      getESPSubTitle,
      handleExport,
      buttonText,
    };
  },
});
</script>

<style></style>
