<template>
  <PanelStyle title="Preview text">
    <div class="preview__text__style">
      <textarea
        class="canvas__textarea"
        v-model="localValue"
        placeholder="Add email preview text..."
      >
      </textarea>
      <p>This text will be shown by some email clients as preview text</p>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import { generalStyleUpdater } from "@/composables/canvas/modifiers/general-style-updater";

export default defineComponent({
  name: "SidebarPreviewTextStyle",
  components: { PanelStyle },

  setup() {
    const name = "previewText";
    const { modifier } = generalStyleUpdater(name);

    const localValue = computed({
      get: () => modifier.value,
      set: (newValue) => {
        if (!newValue) return;
        modifier.value = newValue;
      },
    });

    watch(modifier, (newVal: string) => {
      localValue.value = newVal;
    });

    return {
      localValue,
    };
  },
});
</script>
