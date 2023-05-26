<template>
  <!--  {{ classes }}-->
  <div
    class="workspace__component__items__list__item"
    v-html="componentItem.html"
    :draggable="true"
    @dragstart.self="moveComponentItemPosition($event, itemIndex)"
    @drop="changeComponentItemPosition($event, itemIndex, projectId)"
    @dragover.prevent
    @dragenter.prevent
    v-if="isMounted"
  ></div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import { updateDom } from "@/composables/canvas/update_dom";
import { layers } from "@/composables/canvas/layers";

export default defineComponent({
  name: "WorkspaceComponentItemsListItem",

  props: {
    projectId: {
      type: String,
      required: true,
    },
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: [Number, String],
      required: true,
    },
    isMounted: {
      type: Boolean,
      required: true,
    },
  },

  setup(props) {
    const { moveComponentItemPosition, changeComponentItemPosition } =
      drag_and_drop();

    const { updateElementDom } = updateDom();

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const classes = computed(() => {
      return props.componentItem.json.map((el: any) => el.classes);
    });

    watch(
      () => props.isMounted,
      (value) => {
        if (value) {
          loadStylesForComponent(props);
        }
      }
    );

    // watch(
    //   workspaceComponents,
    //   (newVal) => {
    //     const el = document.getElementById(focusedElement.value.id);
    //     el.classList.add("focus");
    //   },
    //   { deep: true }
    // );

    const loadStylesForComponent = (props: any) => {
      let html = props.componentItem.html;
      const json = props.componentItem.json;

      for (let elementJson of json) {
        if (!elementJson.attributes.style.value) continue;

        html = updateElementDom(html, elementJson);

        //   if (elementJson.id === "header9_headerLink3") {
        //     console.log({
        //       elementJson: JSON.parse(JSON.stringify(elementJson)),
        //       attributes: JSON.parse(JSON.stringify(elementJson.attributes)),
        //     });
        //     console.log(html);
        //   }
      }
      //eslint-disable-next-line vue/no-mutating-props
      props.componentItem.html = html;
    };

    return {
      classes,
      moveComponentItemPosition,
      changeComponentItemPosition,
    };
  },
});
</script>
