<template>
  <CanvasLayout>
    <template v-slot:sidebar>
      <div class="components__container">
        <h5 class="components__title">Components</h5>
        <ul class="components__list" id="components-list">
          <li
            v-for="component in components"
            :key="component.id"
            class="component__list-item"
          >
            <a
              @click="fetchComponentItems(component)"
              class="component__list-link"
              :class="{
                active:
                  selectedComponent && selectedComponent.id === component.id,
              }"
              href="#"
              >{{ component.name }}</a
            >
          </li>
        </ul>
      </div>
      <div class="component__items__container hide" id="component-items">
        <div
          v-for="(componentItem, itemIndex) in componentItems"
          :key="componentItem.id"
        >
          <div
            :draggable="true"
            @dragstart.self="dragComponentItemToCanvas($event, itemIndex)"
            v-html="componentItem.html"
            style="cursor: pointer"
          ></div>
        </div>
      </div>
    </template>
    <template v-slot:workspace> </template>
  </CanvasLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";
import { ui } from "@/assets/js/canvas";

export default defineComponent({
  name: "CanvasPage",
  components: { CanvasLayout },

  setup() {
    onMounted(() => {
      store.dispatch("components/getComponents");
    });

    const selectedComponent = ref({});

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const components = computed(() => {
      return store.getters["components/components"];
    });

    const componentItems = computed(() => {
      return store.getters["components/componentItems"];
    });

    const myComponentItems = computed(() => {
      return store.getters["components/myComponentItems"];
    });

    const fetchComponentItems = (component) => {
      ui.changeComponentItemsStatus();
      selectedComponent.value = component;
      store.dispatch("components/getComponentItems", component.id);
    };

    const dragComponentItemToCanvas = (e, itemIndex) => {
      console.log("DRAG FROM SIDBAR TO WORKSPACE >>>>>>>>>> 1");

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";

      e.dataTransfer.setData("componentItemIndex", itemIndex);
      e.dataTransfer.setData("type", "from-sidebar");
    };

    const moveComponentItem = (e) => {
      console.log("PASTE FROM SIDBAR TO WORKSPACE >>>>>>>>>> 1");

      // const componentItemId = e.dataTransfer.getData("componentItemId");
      const componentItemIndex = e.dataTransfer.getData("componentItemIndex");

      // const componentItem = componentItems.value.find(
      //   (item) => item.id == componentItemId
      // );

      const componentItem = componentItems.value[parseInt(componentItemIndex)];
      myComponentItems.value.push(componentItem);

      console.log({ myComponentItems: myComponentItems.value });
      console.log({ componentItem: componentItem, componentItemIndex });
      // console.log({ componentItemId });

      store.commit("components/SET_MY_COMPONENT_ITEMS", myComponentItems);
    };

    const moveComponentItemPosition = (e, itemIndex) => {
      console.log("DRAG POSITION OF COMPONENT ITEMS >>>> 2");

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";

      e.dataTransfer.setData("fromComponentItemIndex", itemIndex);
      e.dataTransfer.setData("type", "from-workspace");
    };

    const changeComponentItemPosition = (e, toIndex) => {
      const type = e.dataTransfer.getData("type");

      if (type === "from-sidebar") {
        moveComponentItem(e);
      } else {
        console.log("CHANGE POSITION OF COMPONENT ITEMS >>>> 2");

        const fromComponentItemIndex = e.dataTransfer.getData(
          "fromComponentItemIndex"
        );

        console.log({ toIndex, fromComponentItemIndex });
        const componentItem =
          myComponentItems.value[parseInt(fromComponentItemIndex)];

        myComponentItems.value.splice(parseInt(fromComponentItemIndex), 1);
        myComponentItems.value.splice(parseInt(toIndex), 0, componentItem);

        store.commit("components/SET_MY_COMPONENT_ITEMS", myComponentItems);
      }
    };

    return {
      project,
      selectedComponent,
      components,
      componentItems,
      dragComponentItemToCanvas,
      fetchComponentItems,
    };
  },
});
</script>
