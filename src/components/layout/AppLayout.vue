<template>
  <BaseLayout>
    <section class="app__layout" :class="{ with__modal: hasModal }">
      <div class="app__container">
        <div class="app__header">
          <div class="app__content__container">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </div>
        </div>
        <div class="app__body">
          <div class="app__content__container">
            <slot />
          </div>
        </div>
      </div>
    </section>

    <ProjectDuplicate />
    <ProjectDelete />
    <FolderDuplicate />
    <FolderCreate />
  </BaseLayout>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import store from "@/store";
import ProjectDuplicate from "@/components/projects/actions/ProjectDuplicate.vue";
import ProjectDelete from "@/components/projects/actions/ProjectDelete.vue";
import FolderDuplicate from "@/components/folders/actions/FolderDuplicate.vue";
import FolderCreate from "@/components/folders/actions/FolderCreate.vue";

export default defineComponent({
  name: "AppLayout",
  components: {
    FolderCreate,
    FolderDuplicate,
    ProjectDelete,
    ProjectDuplicate,
    BaseLayout,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },

  setup() {
    const hasModal = computed(() => {
      return store.getters["modals/isCenterModals"];
    });

    return { hasModal };
  },
});
</script>

<style></style>
