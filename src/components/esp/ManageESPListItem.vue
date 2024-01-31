<template>
  <div class="manage__esps__list__item">
    <div class="manage__esps__list__item__content">
      <div class="esps__list__item__icon">
        <BaseIcon :icon="`header/export/${esp}`" />
        <span
          :class="{ active: checkESPForUser }"
          class="esp__icon__status"
        ></span>
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

    const checkESPForUser = computed(() => {
      return esps.value.find((espItem: any) => espItem.esp === props.esp);
    });

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
      if (checkESPForUser.value) {
        disconnect();
      } else {
        connect();
      }
    };

    const getESPSubTitle = () => {
      let desc = "";
      if (checkESPForUser.value) {
        desc = disabled.value
          ? "Disconnecting account..."
          : "App integration connected";
      } else {
        desc = "Not connected";
      }
      return desc;
    };

    const buttonText = computed(() => {
      return checkESPForUser.value ? "Disconnect" : "Connect";
    });

    return {
      disabled,
      getESPSubTitle,
      handleAction,
      connect,
      buttonText,
      checkESPForUser,
    };
  },
});
</script>

<style></style>
