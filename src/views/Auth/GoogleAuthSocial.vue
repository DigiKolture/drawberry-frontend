<template>
  <button
    :disabled="!Vue3GoogleOauth.isInit"
    type="button"
    class="auth__form-socials__google"
    @click="handleSignIn"
  >
    <BaseIcon icon="auth/social/google" />
    <span>Continue with Google</span>
  </button>
</template>

<script>
import { defineComponent, inject } from "vue";
import store from "@/store";
import router from "@/router";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "GoogleAuthSocial",
  components: { BaseIcon },

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
    const Vue3GoogleOauth = inject("Vue3GoogleOauth");

    return {
      Vue3GoogleOauth,
    };
  },
});
</script>
