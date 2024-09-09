<template>
  <AuthLayout>
    <div v-if="!submitted" class="auth__main login">
      <form class="auth__form" @submit.prevent="login">
        <div class="auth__form-content">
          <h3>Welcome</h3>
        </div>
        <div class="auth__form-socials">
          <GoogleAuthSocial />
        </div>

        <div class="auth__form__divider">
          <span></span>
          <span>or</span>
          <span></span>
        </div>

        <AuthError :message="errMessage" />

        <div class="auth__form-inputs">
          <FormGroup>
            <BaseLabel title="Email" />
            <BaseInput
              v-model="user.email"
              type="email"
              placeholder="Email address"
              required
            />
          </FormGroup>
          <FormGroupPassword v-model="user.password" />
        </div>
        <div class="auth__submit">
          <router-link to="/forgot/password">Forgot password?</router-link>
          <BaseButton :disabled="disabled" type="submit" title="Continue" />
        </div>
      </form>
      <div class="form__footer">
        <p>
          Don’t have an account?
          <router-link to="/register">Sign Up</router-link>
        </p>
      </div>
    </div>

    <VerifyAccount :email="user.email" v-else />
  </AuthLayout>
</template>
<script>
import { defineComponent, reactive, ref } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import FormGroup from "@/components/layout/FormGroup";
import BaseLabel from "@/components/form/BaseLabel";
import BaseInput from "@/components/form/BaseInput";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import router from "@/router";
import FormGroupPassword from "@/components/form/FormGroupPassword.vue";
import AuthError from "@/components/auth/error/AuthError.vue";
import GoogleAuthSocial from "@/views/Auth/GoogleAuthSocial.vue";
import VerifyAccount from "@/components/auth/VerifyAccount.vue";
export default defineComponent({
  name: "LoginPage",
  components: {
    VerifyAccount,
    GoogleAuthSocial,
    AuthError,
    FormGroupPassword,
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
    AuthLayout,
  },

  setup() {
    const user = reactive({
      email: "",
      password: "",
    });

    const errMessage = ref("");
    const disabled = ref(false);
    const submitted = ref(false);

    const login = async () => {
      errMessage.value = "";
      disabled.value = true;
      store
        .dispatch("auth/login", user)
        .then((res) => {
          const { user } = res.data;
          if (user.verified) {
            disabled.value = false;
            router.push("/projects");
          } else {
            submitted.value = true;
          }
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };

    return {
      errMessage,
      submitted,
      disabled,
      user,
      login,
    };
  },
});
</script>
