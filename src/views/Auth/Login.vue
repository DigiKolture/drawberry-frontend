<template>
  <AuthLayout>
    <div class="auth__main login">
      <form class="auth__form" @submit.prevent="login">
        <div class="auth__form-content">
          <h3>Welcome</h3>
        </div>

        <div class="auth__form-socials">
          <button class="auth__form-socials__google">
            <BaseIcon icon="auth/social/google" />
            <span>Continue with Google</span>
          </button>
        </div>

        <div class="auth__form__divider">
          <span></span>
          <span>or</span>
          <span></span>
        </div>

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
          <a href="">Forgot password?</a>
          <BaseButton type="submit" title="Sign In" />
        </div>
      </form>
      <div class="form__footer">
        <p>
          Don’t have an account?
          <router-link to="/register">Sign Up</router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>
<script>
import { defineComponent, reactive } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import FormGroup from "@/components/layout/FormGroup";
import BaseLabel from "@/components/form/BaseLabel";
import BaseInput from "@/components/form/BaseInput";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import router from "@/router";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import FormGroupPassword from "@/components/form/FormGroupPassword.vue";

export default defineComponent({
  name: "LoginPage",
  components: {
    FormGroupPassword,
    BaseIcon,
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

    const login = async () => {
      await store.dispatch("auth/login", user).then(() => {
        router.push("/projects");
      });
    };

    return {
      user,
      login,
    };
  },
});
</script>
