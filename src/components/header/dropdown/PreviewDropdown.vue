<template>
  <DropdownLayout class="header-preview" @clicks="handleClick" :data="data" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import store from "@/store";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";

export default defineComponent({
  name: "PreviewDropdown",
  components: { DropdownLayout },

  setup(props, { emit }) {
    const data = [
      {
        icon: "header/preview/desktop",
        event: "desktop",
        name: "Desktop",
      },
      {
        icon: "header/preview/mobile",
        event: "mobile",
        name: "Mobile",
      },
      {
        icon: "header/preview/email",
        event: "email",
        name: "Email",
      },
    ];

    const handleClick = (dropdownName: string) => {
      if (dropdownName === "mobile" || dropdownName === "desktop") {
        store.commit("canvas/SET_CURRENT_PREVIEW", dropdownName);
        //  TODO: Might refresh to remove unnecessary padding added by hover/fcosu
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
