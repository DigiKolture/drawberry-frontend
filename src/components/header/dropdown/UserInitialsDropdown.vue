<template>
  <DropdownLayout class="user-initials" @clicks="handleClick" :data="data" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "UserInitialsDropdown",
  components: { DropdownLayout },

  setup(props, { emit }) {
    const data = ref([
      {
        icon: "header/user/logout",
        event: "logout",
        name: "Log out",
      },
    ]);

    const route = useRoute();
    const router = useRouter();

    onMounted(() => {
      if (route.name === "Canvas") {
        data.value.unshift({
          icon: "header/user/integrations",
          event: "integrations",
          name: "Apps & Integrations",
        });
      }
    });

    const handleClick = (event: string) => {
      switch (event) {
        case "logout": {
          store.commit("auth/LOGOUT");
          router.push("/login");
          break;
        }
        case "integrations": {
          store.commit("auth/LOGOUT");
          router.push("/login");
          break;
        }
      }
    };

    return {
      data,
      handleClick,
    };
  },
});
</script>

<style></style>
