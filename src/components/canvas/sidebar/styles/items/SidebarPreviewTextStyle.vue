<template>
  <PanelStyle title="Preview text">
    <div class="preview__text__style">
      <textarea
        class="canvas__textarea"
        v-model="content"
        placeholder="Add email preview text..."
      >
      </textarea>
      <p>This text will be shown by some email clients as preview text</p>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import store from "@/store";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";

export default defineComponent({
  name: "SidebarPreviewTextStyle",
  components: { PanelStyle },

  setup() {
    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const content = ref(style.value.previewText);

    watch(content, (newVal: string) => {
      // TODO: Or update with ENTER
      if (newVal) {
        style.value.previewText = newVal;
        store.dispatch("canvas/updateProjectStyle", style.value);
      }
    });

    return {
      content,
    };
  },
});
</script>
