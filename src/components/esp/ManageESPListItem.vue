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
        @click="handleAction"
        class="button__outline"
        :disabled="disabled"
        :title="!disabled ? buttonText : 'Disabled'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
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
    const disabled = ref(false);

    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const checkESPForUser = (esp: string) => {
      return esps.value.find((espItem: any) => espItem.esp === esp);
    };

    const connect = () => {
      store.dispatch("esp/getESPRedirectURL", props.esp);
    };

    const disconnect = () => {
      disabled.value = true;
      store
        .dispatch("esp/disconnectESP", { esp: props.esp })
        .then(() => {
          store.dispatch("esp/getESPs").then(() => {
            disabled.value = false;
          });
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const handleAction = () => {
      if (checkESPForUser(props.esp)) {
        disconnect();
      } else {
        connect();
      }
    };

    const getESPSubTitle = () => {
      let desc = "";
      if (checkESPForUser(props.esp)) {
        desc = disabled.value
          ? "Disconnecting account..."
          : "App integration connected";
      } else {
        desc = "Not connected";
      }
      return desc;
    };

    const buttonText = computed(() => {
      return checkESPForUser(props.esp) ? "Disconnect" : "Connect";
    });

    return {
      disabled,
      getESPSubTitle,
      handleAction,
      connect,
      buttonText,
    };
  },
});
</script>

<style></style>
