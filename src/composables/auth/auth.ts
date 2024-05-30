import { computed } from "vue";
import store from "@/store";

export function auth() {
  const authUser = computed(() => {
    return store.getters["auth/authUser"];
  });

  const getInitials = computed(() => {
    return `${authUser.value.firstName.charAt(
      0
    )}${authUser.value.lastName.charAt(0)}`;
  });

  return {
    getInitials,
  };
}
