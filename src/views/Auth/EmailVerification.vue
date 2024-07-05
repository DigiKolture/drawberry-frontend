<template>
  <div>
    <BaseIcon v-if="disabled" icon="loader" />
    <p v-else-if="errMessage">{{ errMessage }}</p>
    <p v-else>Account has been verified successfully</p>
  </div>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import { useRoute } from "vue-router";
import router from "@/router";
import BaseIcon from "@/components/icon/BaseIcon.vue";
export default defineComponent({
  name: "EmailVerification",
  components: {
    BaseIcon,
  },

  setup() {
    const route = useRoute();

    const errMessage = ref("");
    const disabled = ref(true);

    onMounted(() => {
      const token = route.params.token;
      emailVerification(token);
    });

    const authUser = computed(() => {
      return store.getters["auth/authUser"];
    });

    const emailVerification = async (token) => {
      store
        .dispatch("auth/emailVerification", token)
        .then(() => {
          disabled.value = false;
          store
            .dispatch("toast/showToast", {
              message: `Account has been verified successfully.`,
              timeout: 3000,
            })
            .then(() => {
              if (authUser.value) {
                router.push("/projects");
              } else {
                router.push("/login");
              }
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
    };
  },
});
</script>
