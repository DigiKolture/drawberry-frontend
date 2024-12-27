<template>
  <ModalLayout class="confirm__modal" @close="cancel" :open="true">
    <template v-slot:heading>
      <h3 class="modal__title">{{ title }}</h3>
    </template>
    <template v-slot:body>
      <div class="modal__content">
        <p>
          {{ description }}
        </p>
      </div>
      <div class="modal__footer">
        <BaseButton @click="cancel" title="No, cancel" />
        <BaseButton
          @click.stop="confirm"
          :disabled="disabled"
          class="danger"
          title="Yes, delete"
          type="submit"
        />
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

  props: {
    title: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
  },

  setup(_, { emit }) {
    const visible = computed(() => {
      return store.getters["toast/visible"];
    });

    const confirm = () => {
      emit("confirm");
    };

    const cancel = () => {
      emit("cancel");
    };

    return {
      visible,
      cancel,
      confirm,
    };
  },
});
</script>

<style scoped></style>
