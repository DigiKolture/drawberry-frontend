<template>
  <PanelStyle title="INSERT LINK">
    <div class="content__style">
      <textarea v-model="href" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "HrefAttribute",
  components: { PanelStyle },
  props: {
    isParent: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  setup(props) {
    const name = "href";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedParentElement = computed(() => {
      return store.getters["canvas/focusedParentElement"];
    });

    const href = ref(
      !props.isParent
        ? focusedElement.value.attributes[name].value
        : focusedParentElement.value.attributes[name].value
    );

    watch(href, (newVal: string) => {
      if (!props.isParent) {
        focusedElement.value.attributes[name].value = newVal;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedParentElement.value.attributes[name].value = newVal;
        store.dispatch(
          "canvas/updateFocusedParentElement",
          focusedParentElement.value
        );
      }
    });

    watch(focusedElement, (newVal) => {
      if (!props.isParent) {
        href.value = newVal.attributes[name].value;
      }
    });

    watch(focusedParentElement, (newVal) => {
      if (props.isParent) {
        href.value = newVal.attributes[name].value;
      }
    });

    return {
      href,
    };
  },
});
</script>
