<template>
  <AuthLayout>
    <div class="auth__main login">
      <form class="auth__form" @submit.prevent="login">
        <div class="auth__form-content">
          <h3>Welcome</h3>
        </div>
        <h1>Is Initialized: {{ Vue3GoogleOauth.isInit }}</h1>
        <div class="auth__form-socials">
          <button
            :disabled="!Vue3GoogleOauth.isInit"
            type="button"
            class="auth__form-socials__google"
            @click="handleSignIn"
          >
            <BaseIcon icon="auth/social/google" />
            <span>Continue with Google</span>
          </button>
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
          <a href="">Forgot password?</a>
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
import BaseIcon from "@/components/icon/BaseIcon.vue";
import FormGroupPassword from "@/components/form/FormGroupPassword.vue";
import AuthError from "@/components/auth/error/AuthError.vue";
import { inject } from "vue";
export default defineComponent({
  name: "LoginPage",
  components: {
    AuthError,
    FormGroupPassword,
    BaseIcon,
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
    AuthLayout,
  },

  methods: {
    async handleSignIn() {
      try {
        const googleUser = await this.$gAuth.signIn();

        if (!googleUser) {
          return null;
        }
        const email = googleUser.getBasicProfile().getEmail();
        const firstName = googleUser.getBasicProfile().getGivenName();
        const lastName = googleUser.getBasicProfile().getFamilyName();
        console.log({ email, firstName, lastName });

        await store
          .dispatch("auth/oAuthLogin", {
            email,
            firstName,
            lastName,
          })
          .then(() => {
            router.push("/projects");
          });
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  },

  setup() {
    const user = reactive({
      email: "",
      password: "",
    });

    const Vue3GoogleOauth = inject("Vue3GoogleOauth");

    const errMessage = ref("");
    const disabled = ref(false);

    const login = async () => {
      errMessage.value = "";
      disabled.value = true;
      store
        .dispatch("auth/login", user)
        .then(() => {
          disabled.value = false;
          router.push("/projects");
        })
        .catch((message) => {
          disabled.value = false;
          errMessage.value = message;
        });
    };

    return {
      errMessage,
      Vue3GoogleOauth,
      disabled,
      user,
      login,
    };
  },
});
</script>
