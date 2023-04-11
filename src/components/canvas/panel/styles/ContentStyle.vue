<template>
  <PanelStyle title="Content">
    <div class="content__style">
      <textarea v-model="content" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "ContentStyle",
  components: { PanelStyle },

  setup() {
    const name = "innerHtml";
    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const content = ref(focusedElement.value[name]);

    watch(content, (newVal: string) => {
      if (newVal) {
        focusedElement.value[name] = newVal;
        store.commit(
          "canvas/UPDATE_FOCUSED_JSON_AND_DOM",
          focusedElement.value
        );
      }
    });

    watch(focusedElement, (newVal) => {
      content.value = newVal[name];
    });

    return {
      content,
    };
  },
});
</script>
