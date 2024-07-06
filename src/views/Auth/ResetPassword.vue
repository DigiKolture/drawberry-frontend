<template>
  <AuthLayout>
    <div class="auth__main">
      <form class="auth__form" @submit.prevent="forgotPassword">
        <div class="auth__form-content">
          <h3>Reset password</h3>
        </div>

        <AuthError :message="errMessage" />

        <div class="auth__form-inputs">
          <FormGroupPassword v-model="user.password" title="New password" />
          <FormGroupPassword
            v-model="user.confirmPassword"
            title="Confirm password"
          />
        </div>
        <div class="auth__submit">
          <BaseButton :disabled="disabled" type="submit" title="Continue" />
        </div>
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
import { defineComponent, onMounted, reactive, ref } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import store from "@/store";
import AuthError from "@/components/auth/error/AuthError.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import FormGroupPassword from "@/components/form/FormGroupPassword.vue";
import { useRoute } from "vue-router";
import router from "@/router";
export default defineComponent({
  name: "ResetPassword",
  components: {
    FormGroupPassword,
    BaseButton,
    AuthError,
    AuthLayout,
  },

  setup() {
    const user = reactive({
      password: "",
      confirmPassword: "",
    });
    const route = useRoute();

    const errMessage = ref("");
    const disabled = ref(false);

    const validatePassword = () => {
      if (user.password !== user.confirmPassword) {
        errMessage.value = "Both passwords must match";
        disabled.value = false;
        return true;
      }
      return false;
    };

    const forgotPassword = async () => {
      errMessage.value = "";
      disabled.value = true;
      const err = validatePassword();
      if (err) return;
      store
        .dispatch("auth/resetPassword", {
          token: route.params.token,
          password: user.password,
        })
        .then(() => {
          disabled.value = false;
          store
            .dispatch("toast/showToast", {
              message: `Password reset successful.`,
              timeout: 1000,
            })
            .then(() => {
              router.push("/projects");
            });
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };

    return {
      errMessage,
      disabled,
      user,
      forgotPassword,
    };
  },
});
</script>
