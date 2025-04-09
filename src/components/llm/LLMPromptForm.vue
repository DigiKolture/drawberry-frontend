<template>
  <form @submit.prevent="submit" id="chatForm" class="chat-form">
    <div class="input-container">
      <input
        type="text"
        id="userInput"
        placeholder="Type your message..."
        autocomplete="off"
        v-model="prompt"
        required
      />
      <button type="submit" class="send-btn" aria-label="Send">
        <!-- Send icon (Heroicons style) -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          width="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#519E47"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 20l16-8L4 4v6l12 2-12 2v6z"
          />
        </svg>
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import {
  HistoryActionTypes,
  HistoryComponentUpdateTypes,
} from "@/store/modules/history/types";
import { history } from "@/composables/canvas/history";
import { canvas } from "@/composables/canvas/canvas";
import { ActionToEditableTypeMap } from "@/store/modules/canvas/types";
import { modifiersLLM } from "@/composables/canvas/modifiers/modifiers-llm";

export default defineComponent({
  name: "LLMPromptForm",
  setup() {
    const {
      updateStyleLLM,
      updateProjectStyleLLM,
      duplicateProjectComponentLLM,
      updateProjectComponentModifyPositionLLM,
      deleteProjectComponentLLM,
    } = modifiersLLM();
    const { updateElementFocusAndScroll } = history();
    const { getElementWithComponentIndex } = canvas();

    const prompt = computed({
      get: () => store.getters["canvas/llmPrompt"],
      set: (val: string) => store.commit("canvas/SET_LLM_PROMPT", val),
    });

    const submit = () => {
      store
        .dispatch("canvas/updateProjectComponentsAndStylesWithLLM")
        .then((data) => {
          console.log(data);
          const componentUpdates = data.componentUpdates;
          if (componentUpdates.length === 0) {
            return;
          }

          for (const update of componentUpdates) {
            if (
              Object.values(HistoryComponentUpdateTypes).includes(update.type)
            ) {
              updateStyleLLM(update);
            } else if (update.type === HistoryActionTypes.PROJECT_STYLE) {
              updateProjectStyleLLM(update);
            } else if (
              update.type === HistoryActionTypes.PROJECT_COMPONENT_DUPLICATE
            ) {
              duplicateProjectComponentLLM(update);
            } else if (
              update.type ===
              HistoryActionTypes.PROJECT_COMPONENT_MODIFY_POSITION
            ) {
              updateProjectComponentModifyPositionLLM(update);
            } else if (
              update.type === HistoryActionTypes.PROJECT_COMPONENT_DELETE
            ) {
              deleteProjectComponentLLM(update);
            }
          }

          // Focus on the last update from the list.
          const lastComponentUpdate =
            componentUpdates[componentUpdates.length - 1];

          if (
            Object.values(HistoryComponentUpdateTypes).includes(
              lastComponentUpdate.type
            )
          ) {
            const element = getElementWithComponentIndex(
              lastComponentUpdate.componentIndex,
              lastComponentUpdate.elementId
            );

            if (!element) {
              return;
            }

            const type: HistoryComponentUpdateTypes = lastComponentUpdate.type;
            const editableType = ActionToEditableTypeMap[type];

            updateElementFocusAndScroll(
              lastComponentUpdate.componentIndex,
              element,
              lastComponentUpdate.modifier,
              editableType
            ).then();
          }
        });
    };

    return { prompt, submit };
  },
});
</script>

<style scoped>
.chat-wrapper {
  max-width: 600px;
  margin: 40px auto;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 80vh;
  font-family: sans-serif;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chat-box {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #2d3039;
}

.chat-message {
  padding: 12px 16px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
}

.user {
  align-self: flex-end;
  background-color: #2d3039;
}

.assistant {
  align-self: flex-start;
  background-color: #2d3039;
}

.chat-form {
  border-top: 1px solid #2d3039;
  background: #2d3039;
  padding: 12px;
}

.input-container {
  display: flex;
  align-items: center;
  border: 1px solid #848f9f;
  border-radius: 999px;
  padding: 6px 12px;
  background-color: #2d3039;
}

.input-container input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px;
  font-size: 15px;
}

.send-btn {
  background: none;
  border: none;
  padding: 0 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
