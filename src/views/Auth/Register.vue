<template>
  <AuthLayout>
    <div class="auth__main">
      <form class="auth__form" @submit.prevent="register">
        <div class="auth__form-content">
          <h3>Create an account</h3>
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
          <div class="auth__form__row">
            <FormGroup>
              <BaseLabel title="First Name" />
              <BaseInput
                v-model="user.firstName"
                type="text"
                placeholder="First name"
                required
              />
            </FormGroup>
            <FormGroup>
              <BaseLabel title="Last Name" />
              <BaseInput
                v-model="user.lastName"
                type="text"
                placeholder="Last name"
                required
              />
            </FormGroup>
          </div>
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
            <BaseLabel title="Country" />
            <BaseSelect
              v-model="user.countryCode"
              title="Select country"
              :options="countries"
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
          <BaseButton type="submit" title="Create Account" />
        </div>
      </form>
      <div class="form__footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in</router-link>
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
import BaseSelect from "@/components/form/BaseSelect";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "RegisterPage",
  components: {
    BaseSelect,
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
    BaseIcon,
    AuthLayout,
  },
  setup() {
    const countries = [
      {
        title: "Nigeria",
        value: "NG",
      },
      {
        title: "Ghana",
        value: "GH",
      },
      {
        title: "France",
        value: "FR",
      },
    ];
    const user = reactive({
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "",
      password: "",
    });

    const register = async () => {
      await store.dispatch("auth/register", user).then(() => {
        router.push("/projects");
      });
    };

    return {
      user,
      countries,
      register,
    };
  },
});
</script>
