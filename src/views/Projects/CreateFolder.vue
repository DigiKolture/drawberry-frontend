<template>
  <div class="modal open">
    <div class="modal__header">
      <button @click="close" class="modal__header__close">
        <BaseIcon icon="close" />
      </button>
      <h3 class="modal__title">Create Folder</h3>
    </div>
    <form>
      <div class="modal__content">
        <div class="form-group">
          <BaseLabel title="Folder name"></BaseLabel>
          <BaseInput required />
        </div>
      </div>
      <div class="modal__footer">
        <BaseButton title="Cancel" />
        <BaseButton class="success" title="Create Folder" type="submit" />
      </div>
    </form>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";
import BaseInput from "@/components/form/BaseInput";
import BaseLabel from "@/components/form/BaseLabel";
import BaseButton from "@/components/layout/BaseButton";

export default defineComponent({
  name: "CreateFolder",
  components: {
    BaseButton,
    BaseLabel,
    BaseInput,
    BaseIcon,
  },

  setup(props, { emit }) {
    const close = async () => {
      emit("close");
    };

    return {
      close,
    };
  },
});
</script>
