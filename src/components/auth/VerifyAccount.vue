<template>
  <div class="auth__verify">
    <BaseIcon class="auth__verify__icon" icon="auth/verify" />
    <div class="auth__verify__content">
      <h3 class="auth__form-content-title">Verify account</h3>
      <p class="auth__form-content-desc">
        A verification link has been sent to <span>{{ email }}</span
        >. Follow the instructions to activate your account.
      </p>
    </div>
    <div class="form__footer">
      <p>
        Didn’t get an email?
        <a @click="resendVerification">Resend</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "VerifyAccount",
  components: { BaseIcon },
  props: {
    email: {
      type: String,
      required: true,
    },
  },

  setup() {
    const errMessage = ref("");
    const disabled = ref(false);
    const resendVerification = async () => {
      errMessage.value = "";
      disabled.value = true;
      store
        .dispatch("auth/resendVerification")
        .then(() => {
          store.dispatch("toast/showToast", {
            message: `Email verification sent successfully.`,
            timeout: 5000,
          });
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };

    return {
      resendVerification,
    };
  },
});
</script>

<style scoped></style>
