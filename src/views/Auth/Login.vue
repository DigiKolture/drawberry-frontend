<template>
  <AuthLayout>
    <div class="auth__main login">
      <div class="auth__main__close">
        <button>
          <BaseIcon icon="close" />
        </button>
      </div>
      <form class="auth__form" @submit.prevent="login">
        <div class="auth__form-content">
          <h3>Login</h3>
          <p>Enter your account details</p>
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
          <FormGroup>
            <BaseLabel title="Password" />
            <BaseInput
              v-model="user.password"
              type="password"
              placeholder="Password"
              required
            />
          </FormGroup>
        </div>
        <div class="auth__submit">
          <a href="">Forgot password?</a>
          <BaseButton type="submit" title="Sign In" />
        </div>
      </form>
      <div class="form__footer">
        <p>
          Don’t have an account?
          <router-link to="/register">Sign Up here</router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>
<script>
import { defineComponent, reactive } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import BaseIcon from "@/components/icon/BaseIcon";
import FormGroup from "@/components/layout/FormGroup";
import BaseLabel from "@/components/form/BaseLabel";
import BaseInput from "@/components/form/BaseInput";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "LoginPage",
  components: {
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
    BaseIcon,
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
