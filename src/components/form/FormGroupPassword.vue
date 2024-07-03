<template>
  <FormGroup>
    <BaseLabel :title="title" />
    <div class="input__group">
      <BaseInput
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="`${hidePassword ? 'password' : 'text'}`"
        placeholder="Password"
        required
      />
      <button
        type="button"
        @click="togglePassword"
        class="input__group__append"
      >
        <BaseIcon :icon="`auth/password/${hidePassword ? 'hide' : 'show'}`" />
      </button>
    </div>
  </FormGroup>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import FormGroup from "@/components/layout/FormGroup.vue";
import BaseLabel from "@/components/form/BaseLabel.vue";

export default defineComponent({
  name: "FormGroupPassword",
  components: { BaseLabel, FormGroup, BaseInput, BaseIcon },

  props: {
    modelValue: {
      type: [String, Number],
      default: "",
      required: false,
    },
    title: {
      type: String,
      default: "Password",
      required: false,
    },
  },

  setup() {
    const hidePassword = ref(true);

    const togglePassword = () => {
      hidePassword.value = !hidePassword.value;
    };

    return {
      hidePassword,
      togglePassword,
    };
  },
});
</script>

<style scoped></style>
