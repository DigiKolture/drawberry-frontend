<template>
  <ModalLayout class="share__project__preview" @close="close" :open="true">
    <template v-slot:heading>
      <h3 class="modal__title">Duplicate project</h3>
    </template>
    <template v-slot:body>
      <div class="modal__content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur,
          earum error facere quo repellat voluptatum. Alias, animi doloribus est
          fuga harum id nobis odio omnis reiciendis reprehenderit sit totam
          unde.
        </p>
      </div>
      <div class="modal__footer">
        <BaseButton @click="close" title="No, cancel" />
        <BaseButton class="danger" title="Yes, delete" type="submit" />
      </div>
    </template>
  </ModalLayout>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import BaseButton from "@/components/layout/BaseButton.vue";
import ModalLayout from "@/components/layout/ModalLayout.vue";

export default defineComponent({
  name: "ConfirmModal",
  components: { ModalLayout, BaseButton },

  setup() {
    const visible = computed(() => {
      return store.getters["toast/visible"];
    });

    return {
      visible,
    };
  },
});
</script>

<style scoped></style>
