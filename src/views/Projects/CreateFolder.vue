<template>
  <div class="modal open">
    <div class="modal__header">
      <button @click="close" class="modal__header__close">
        <BaseIcon icon="close" />
      </button>
      <h3 class="modal__title">Create Folder</h3>
    </div>
    <form @submit.prevent="storeFolder">
      <div class="modal__content">
        <div class="form-group">
          <BaseLabel v-model="folder.name" title="Folder name"></BaseLabel>
          <BaseInput required />
        </div>
      </div>
      <div class="modal__footer">
        <BaseButton @click="close" title="Cancel" />
        <BaseButton class="success" title="Create Folder" type="submit" />
      </div>
    </form>
  </div>
</template>
<script>
import { defineComponent, reactive } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";
import BaseInput from "@/components/form/BaseInput";
import BaseLabel from "@/components/form/BaseLabel";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "CreateFolder",
  components: {
    BaseButton,
    BaseLabel,
    BaseInput,
    BaseIcon,
  },

  setup(props, { emit }) {
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
