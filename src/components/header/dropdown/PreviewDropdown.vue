<template>
  <DropdownLayout class="header-preview" @clicks="handleClick" :data="data" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import router from "@/router";
import { useRoute } from "vue-router";
import store from "@/store";

export default defineComponent({
  name: "PreviewDropdown",
  props: {
    isPreview: {
      type: Boolean,
      required: true,
    },
  },
  components: { DropdownLayout },

  setup(props) {
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

    const route = useRoute();

    const handleClick = (dropdownName: string) => {
      if (dropdownName === "mobile" || dropdownName === "desktop") {
        store.commit("preview/SET_CURRENT_PREVIEW", dropdownName);
        if (!props.isPreview) {
          router.push({ name: "Preview", params: { id: route.params.id } });
        }
      } else if (dropdownName === "email") {
        store.commit("modals/CLOSE_MODAL", "preview");
        store.commit("modals/OPEN_MODAL", "email_preview");
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
