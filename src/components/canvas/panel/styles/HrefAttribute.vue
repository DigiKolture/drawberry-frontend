<template>
  <PanelStyle title="HREF">
    <div class="content__style">
      <textarea v-model="href" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle";
import store from "@/store";

export default defineComponent({
  name: "HrefAttribute",
  components: { PanelStyle },

  setup() {
    const name = "href";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const href = ref(focusedElement.value.attributes[name].value);

    watch(href, (newVal: string) => {
      focusedElement.value.attributes[name].value = newVal;
      store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      href.value = newVal.attributes[name].value;
    });

    return {
      href,
    };
  },
});
</script>
