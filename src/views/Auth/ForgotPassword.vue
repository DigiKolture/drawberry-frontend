<template>
  <AuthLayout>
    <div class="auth__main" :class="{ submitted }">
      <form class="auth__form" @submit.prevent="forgotPassword">
        <div class="auth__form-content" :class="{ submitted }">
          <h3>Reset password</h3>
        </div>

        <AuthError :message="errMessage" />

        <div class="auth__forgot-password-submitted" v-if="submitted">
          <p>
            A password reset link has been sent to [{{ user.email }}]. Follow
            the instructions to reset your password.
          </p>
          <div class="form__footer">
            <p>
              Didnt get an email?
              <a @click="cancel">Resend</a>
            </p>
          </div>
          <div class="auth__form__divider">
            <span></span>
            <span>or</span>
            <span></span>
          </div>
        </div>

        <template v-else>
          <div class="auth__form-inputs">
            <FormGroup>
              <BaseLabel title="Email" />
              <BaseInput
                v-model="user.email"
                type="email"
                name="email"
                placeholder="Email address"
                required
              />
            </FormGroup>
          </div>
          <div class="auth__submit">
            <BaseButton :disabled="disabled" type="submit" title="Continue" />
          </div>
        </template>
      </form>
      <div class="form__footer">
        <p>
          Remember your password?
          <router-link to="/login">Sign In</router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>
<script>
import { defineComponent, reactive, ref } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import FormGroup from "@/components/layout/FormGroup";
import BaseLabel from "@/components/form/BaseLabel";
import BaseInput from "@/components/form/BaseInput";
import store from "@/store";
import AuthError from "@/components/auth/error/AuthError.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
export default defineComponent({
  name: "ForgotPassword",
  components: {
    BaseButton,
    AuthError,
    BaseInput,
    BaseLabel,
    FormGroup,
    AuthLayout,
  },

  setup() {
    const user = reactive({
      email: "",
    });

    const errMessage = ref("");
    const disabled = ref(false);
    const submitted = ref(false);

    const cancel = () => {
      submitted.value = false;
    };

    const forgotPassword = async () => {
      errMessage.value = "";
      disabled.value = true;
      store
        .dispatch("auth/forgotPassword", user)
        .then(() => {
          disabled.value = false;
          submitted.value = true;
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };

    return {
      errMessage,
      disabled,
      submitted,
      user,
      cancel,
      forgotPassword,
    };
  },
});
</script>
