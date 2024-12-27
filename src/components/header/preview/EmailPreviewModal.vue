<template>
  <ModalLayout class="email__project__preview" @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Email Preview</h3>
      <p class="modal__description">
        {{ previewMessage }}
      </p>
    </template>
    <template v-slot:body>
      <form v-if="!submitted" @submit.prevent="submit">
        <div class="modal__content">
          <FormGroup>
            <BaseLabel title="Registered Email Address" />
            <BaseInput
              v-model="email"
              type="email"
              placeholder="Email address"
              required
            />
          </FormGroup>
        </div>
        <div class="modal__footer">
          <BaseButton class="regular" title="Cancel" @click="close" />
          <BaseButton
            :disabled="disabled"
            type="submit"
            class="success"
            title="Send"
          />
        </div>
      </form>
      <div class="email__project__preview__success" v-else>
        <div class="email__preview__success__message">
          <BaseIcon icon="modals/preview/success" />
          <p>
            Email sent to <span>{{ email }}</span>
          </p>
        </div>
        <div class="email__preview__success__message__close">
          <BaseButton class="regular" title="Close" @click="close" />
        </div>
      </div>
    </template>
  </ModalLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import ModalLayout from "@/components/layout/ModalLayout.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";
import FormGroup from "@/components/layout/FormGroup.vue";
import BaseLabel from "@/components/form/BaseLabel.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "EmailPreviewModal",
  components: {
    BaseIcon,
    BaseInput,
    BaseLabel,
    FormGroup,
    BaseButton,
    ModalLayout,
  },
  setup() {
    const email = ref("");
    const error = ref(false);
    const submitted = ref(false);
    const disabled = ref(false);

    onMounted(() => {
      email.value = "";
      error.value = false;
      submitted.value = false;
    });

    const isOpen = computed(() => {
      return store.getters["modals/emailPreview"];
    });

    const previewMessage = computed(() => {
      return submitted.value
        ? "A test mail was sent to your registered email address below"
        : "A test mail will be sent to your registered email address below";
    });

    const close = () => {
      error.value = false;
      submitted.value = false;
      email.value = "";
      store.commit("modals/CLOSE_MODAL", "email_preview");
    };

    const submit = () => {
      disabled.value = true;
      store
        .dispatch("projects/previewProjectByEmail", { email: email.value })
        .then(() => {
          submitted.value = true;
          disabled.value = false;
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    return {
      email,
      submitted,
      disabled,
      previewMessage,
      close,
      isOpen,
      submit,
    };
  },
});
</script>

<style></style>
