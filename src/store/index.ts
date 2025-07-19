import { createStore } from "vuex";
import auth from "@/store/modules/auth";
import projects from "@/store/modules/projects";
import components from "@/store/modules/components";
import canvas from "@/store/modules/canvas";
import folders from "@/store/modules/folders";
import esp from "@/store/modules/esp";
import modals from "@/store/modules/modals";
import preview from "@/store/modules/preview";
import panel from "@/store/modules/panel";
import layers from "@/store/modules/layers";
import toast from "@/store/modules/toast";
import history from "@/store/modules/history";
import element from "@/store/modules/element";
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    data: "new",
  },
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    projects,
    folders,
    components,
    canvas,
    esp,
    modals,
    preview,
    panel,
    layers,
    toast,
    history,
    element,
  },
  plugins: [
    createPersistedState({
      paths: [
        "auth",
        "components",
        "canvas",
        "esp",
        "modals",
        "preview",
        "panel",
        "layers",
        "toast",
        "history",
        "element",
      ],
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, state) => localStorage.setItem(key, state),
        removeItem: (key) => localStorage.removeItem(key),
      },
    }),
  ],
});
