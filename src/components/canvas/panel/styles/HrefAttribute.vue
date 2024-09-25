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
    childId: {
      type: String,
      default: "",
      required: false,
    },
    childIndex: {
      type: Number,
      default: -1,
      required: false,
    },
  },

  setup(props) {
    const name = "href";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedChildrenElements = computed(
      () => store.getters["canvas/focusedChildrenElements"]
    );

    const getTargetElement = () =>
      props.childId
        ? focusedChildrenElements.value[props.childIndex]
        : focusedElement.value;

    const href = ref(getTargetElement().attributes[name].value);

    watch(href, (newVal: string) => {
      if (!props.childId) {
        focusedElement.value.attributes[name].value = newVal;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedChildrenElements.value[props.childIndex].attributes[name].value =
          newVal;
        store.dispatch(
          "canvas/updateFocusedElement",
          focusedChildrenElements.value[props.childIndex]
        );
      }
    });

    // watch(focusedElement, (newVal) => {
    //   if (!props.isParent) {
    //     href.value = newVal.attributes[name].value;
    //   }
    // });
    //
    // watch(focusedParentElement, (newVal) => {
    //   if (props.isParent) {
    //     href.value = newVal.attributes[name].value;
    //   }
    // });

    return {
      href,
    };
  },
});
</script>
