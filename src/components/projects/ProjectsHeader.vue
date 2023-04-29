<template>
  <div class="projects__header">
    <button @click="toggleOpenCreate" class="projects__header__create">
      <BaseIcon icon="add" />
      <span>Create</span>
      <BaseIcon :icon="`arrow/${openCreate ? 'down' : 'up'}`" />
    </button>
    <CreateDropdown :class="{ open: openCreate }" />

    <div class="projects__header__search">
      <input class="projects__header__search__input" type="text" />
      <div class="projects__header__search__icon">
        <BaseIcon icon="search" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import CreateDropdown from "@/components/projects/CreateDropdown.vue";

export default defineComponent({
  name: "ProjectsHeader",
  components: { CreateDropdown, BaseIcon },

  setup() {
    const openCreate = ref(false);

    const toggleOpenCreate = () => {
      openCreate.value = !openCreate.value;
    };

    return {
      toggleOpenCreate,
      openCreate,
    };
  },
});
</script>

<style></style>
