<template>
  <DropdownLayout class="header-preview" @clicks="handleClick" :data="data" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import store from "@/store";
import DropdownLayout from "@/components/layout/dropdown/DropdownLayout.vue";
import router from "@/router";

export default defineComponent({
  name: "PreviewDropdown",
  props: {
    isPreview: {
      type: Boolean,
      required: true,
    },
  },
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

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const handleClick = (dropdownName: string) => {
      if (dropdownName === "mobile" || dropdownName === "desktop") {
        store.commit("preview/SET_CURRENT_PREVIEW", dropdownName);
        if (!props.isPreview) {
          router.push({ name: "Preview", params: { id: project.value.id } });
        }
        //  TODO: Might refresh to remove unnecessary padding added by hover/focus
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
