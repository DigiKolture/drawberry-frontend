<template>
  <div class="manage__esps__list__item connector__item">
    <div class="connector__item__row">
      <div class="manage__esps__list__item__content">
        <div class="esps__list__item__icon">
          <BaseIcon :icon="`header/export/${entry.icon}`" />
          <span
            :class="{ active: isConnected }"
            class="esp__icon__status"
          ></span>
        </div>
        <div class="esps__list__item__titles">
          <h5 class="dropdown__item__titles__name">{{ entry.displayName }}</h5>
          <p class="dropdown__item__titles__desc">{{ subtitle }}</p>
        </div>
      </div>
      <div class="manage__esps__list__item__action connector__item__actions">
        <BaseButton
          v-if="isConnected"
          @click="exportProject"
          class="button__outline"
          :disabled="busy"
          :title="busy ? 'Please wait' : 'Export'"
        />
        <BaseButton
          @click="handlePrimaryAction"
          class="button__outline"
          :disabled="busy"
          :title="busy ? 'Please wait' : primaryActionText"
        />
      </div>
    </div>

    <!-- API-key form, rendered dynamically from the catalog's credentialFields -->
    <form
      v-if="showForm"
      class="connector__form"
      @submit.prevent="submitApiKey"
    >
      <div
        v-for="field in entry.credentialFields"
        :key="field.key"
        class="connector__form__field"
      >
        <label :for="`${entry.key}-${field.key}`">{{ field.label }}</label>
        <input
          :id="`${entry.key}-${field.key}`"
          v-model="fields[field.key]"
          class="connector__form__input"
          :type="field.type === 'password' ? 'password' : 'text'"
          :placeholder="field.placeholder || ''"
          :required="field.required"
          autocomplete="off"
        />
        <small v-if="field.helpText" class="connector__form__help">{{
          field.helpText
        }}</small>
      </div>
      <p v-if="error" class="connector__form__error">{{ error }}</p>
      <div class="connector__form__actions">
        <BaseButton
          type="submit"
          class="button__outline"
          :disabled="busy"
          :title="busy ? 'Connecting…' : 'Connect'"
          @click="submitApiKey"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";
import { AuthKind, CatalogEntry } from "@/store/modules/connectors/types";

export default defineComponent({
  name: "ManageConnectorListItem",
  components: { BaseButton, BaseIcon },
  props: {
    entry: {
      type: Object as PropType<CatalogEntry>,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    const busy = ref(false);
    const showForm = ref(false);
    const error = ref("");
    const fields = reactive<Record<string, string>>({});

    const connection = computed(() =>
      store.getters["connectors/connectionFor"](props.entry.key)
    );
    const isConnected = computed(() => !!connection.value);
    const isApiKey = computed(() => props.entry.authKind === AuthKind.API_KEY);

    const subtitle = computed(() => {
      if (busy.value) return "Working…";
      if (isConnected.value) {
        return connection.value.accountEmail || "App integration connected";
      }
      return "Not connected";
    });

    const primaryActionText = computed(() => {
      if (isConnected.value) return "Disconnect";
      if (isApiKey.value && showForm.value) return "Cancel";
      return "Connect";
    });

    const toast = (message: string, type = "success") =>
      store.dispatch("toast/showToast", { message, type });

    const disconnect = () => {
      busy.value = true;
      store
        .dispatch("connectors/disconnect", { connector: props.entry.key })
        .then(() => toast(`${props.entry.displayName} disconnected`))
        .catch((err: Error) => toast(err.message, "error"))
        .finally(() => {
          busy.value = false;
        });
    };

    const startConnect = () => {
      error.value = "";
      if (isApiKey.value) {
        showForm.value = !showForm.value;
      } else {
        // OAuth connectors redirect out to the provider.
        store
          .dispatch("connectors/getRedirectURL", props.entry.key)
          .catch((err: Error) => toast(err.message, "error"));
      }
    };

    const handlePrimaryAction = () => {
      if (isConnected.value) return disconnect();
      return startConnect();
    };

    const submitApiKey = () => {
      error.value = "";
      const missing = (props.entry.credentialFields || []).find(
        (f) => f.required && !fields[f.key]
      );
      if (missing) {
        error.value = `${missing.label} is required`;
        return;
      }
      busy.value = true;
      store
        .dispatch("connectors/connectWithApiKey", {
          connector: props.entry.key,
          fields: { ...fields },
        })
        .then(() => {
          showForm.value = false;
          Object.keys(fields).forEach((k) => delete fields[k]);
          toast(`${props.entry.displayName} connected`);
        })
        .catch((err: Error) => {
          error.value = err.message;
        })
        .finally(() => {
          busy.value = false;
        });
    };

    const exportProject = () => {
      busy.value = true;
      store
        .dispatch("connectors/exportProject", {
          connector: props.entry.key,
          projectId: route.params.id,
        })
        .then(() => toast(`Exported to ${props.entry.displayName}`))
        .catch((err: Error) => toast(err.message, "error"))
        .finally(() => {
          busy.value = false;
        });
    };

    return {
      busy,
      showForm,
      error,
      fields,
      connection,
      isConnected,
      isApiKey,
      subtitle,
      primaryActionText,
      handlePrimaryAction,
      submitApiKey,
      exportProject,
    };
  },
});
</script>

<style scoped>
.connector__item {
  height: auto;
  flex-direction: column;
  align-items: stretch;
  row-gap: 8px;
}

.connector__item__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connector__item__actions {
  display: flex;
  column-gap: 8px;
}

.connector__form {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #454856;
}

.connector__form__field {
  display: flex;
  flex-direction: column;
  row-gap: 4px;
}

.connector__form__field label {
  font-size: 12px;
  color: #b7bcc7;
}

.connector__form__input {
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid #454856;
  background: #353843;
  color: #ffffff;
  font-size: 12px;
}

.connector__form__input:focus {
  outline: none;
  border-color: #519e47;
}

.connector__form__help {
  font-size: 11px;
  color: #7c828f;
}

.connector__form__error {
  font-size: 12px;
  color: #e07a5f;
}

.connector__form__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
