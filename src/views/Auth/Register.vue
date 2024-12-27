<template>
  <AuthLayout>
    <div v-if="!submitted" class="auth__main">
      <form class="auth__form" @submit.prevent="register">
        <div class="auth__form-content">
          <h3>Create an account</h3>
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
          <FormGroupPassword v-model="user.password" />
        </div>
        <div class="auth__submit">
          <router-link to="/forgot/password">Forgot password?</router-link>
          <BaseButton
            type="submit"
            :disabled="disabled"
            title="Create Account"
          />
        </div>
      </form>
      <div class="form__footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in</router-link>
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
import BaseSelect from "@/components/form/BaseSelect";
import store from "@/store";
import router from "@/router";
import FormGroupPassword from "@/components/form/FormGroupPassword.vue";
import AuthError from "@/components/auth/error/AuthError.vue";
import GoogleAuthSocial from "@/views/Auth/GoogleAuthSocial.vue";
import VerifyAccount from "@/components/auth/VerifyAccount.vue";

export default defineComponent({
  name: "RegisterPage",
  components: {
    VerifyAccount,
    GoogleAuthSocial,
    AuthError,
    FormGroupPassword,
    BaseSelect,
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
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
    const errMessage = ref("");
    const disabled = ref(false);
    const submitted = ref(false);

    const register = async () => {
      errMessage.value = "";
      disabled.value = true;
      store
        .dispatch("auth/register", user)
        .then(() => {
          submitted.value = true;
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };
    return {
      disabled,
      errMessage,
      user,
      countries,
      register,
      submitted,
    };
  },
});
</script>
