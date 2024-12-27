<template>
  <ModalLayout class="open">
    <template v-slot:heading>
      <h3 class="modal__title">Create Folder</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="storeFolder">
        <div class="modal__content">
          <div class="form-group">
            <BaseLabel title="Folder name"></BaseLabel>
            <BaseInput v-model="folder.name" required />
          </div>
        </div>
        <div class="modal__footer">
          <BaseButton @click="close" title="Cancel" />
          <BaseButton class="success" title="Create Folder" type="submit" />
        </div>
      </form>
    </template>
  </ModalLayout>
</template>
<script>
import { defineComponent, reactive } from "vue";
import BaseInput from "@/components/form/BaseInput";
import BaseLabel from "@/components/form/BaseLabel";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import router from "@/router";
import ModalLayout from "@/components/layout/ModalLayout";

export default defineComponent({
  name: "CreateFolder",
  components: {
    ModalLayout,
    BaseButton,
    BaseLabel,
    BaseInput,
  },

  setup(_, { emit }) {
    const folder = reactive({
      name: "",
    });

    const close = async () => {
      emit("close");
    };

    const storeFolder = async () => {
      await store.dispatch("folders/storeFolder", folder).then(() => {
        router.push("/projects");
      });
    };

    return {
      close,
      folder,
      storeFolder,
    };
  },
});
</script>
