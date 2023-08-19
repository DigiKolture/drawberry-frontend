import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/Auth/Login.vue";
import Register from "@/views/Auth/Register.vue";
import ProjectIndex from "@/views/Projects/ProjectIndex.vue";
import CreateFolder from "@/views/Projects/CreateFolder.vue";
import Canvas from "@/views/Projects/Canvas.vue";
import store from "@/store";
import ESPOAuthCallback from "@/views/ESP/ESPOAuthCallback.vue";
import Preview from "@/views/Projects/Preview.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Login,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/projects",
    name: "ProjectIndex",
    component: ProjectIndex,
    meta: {
      authRequired: true,
    },
    children: [
      {
        path: "/folder/create",
        name: "CreateFolder",
        component: CreateFolder,
        props: true,
      },
    ],
  },

  {
    path: "/projects/canvas/:id",
    name: "Canvas",
    props: true,
    component: Canvas,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/project/:id/preview",
    name: "Preview",
    props: true,
    component: Preview,
    meta: {
      authRequired: false,
    },
  },

  {
    path: "/esp/:esp/callback",
    name: "ESPOAuthCallback",
    props: true,
    component: ESPOAuthCallback,
    meta: {
      authRequired: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((routeTo, routeFrom, next) => {
  const authRequired = routeTo.matched.some((route) => route.meta.authRequired);
  const authUser = store.getters["auth/authUser"];
  // const jwt = store.getters["auth/jwt"];
  const jwt = localStorage.getItem("access-token");

  if (!authRequired) {
    return next();
  }

  if (authUser && jwt) {
    return next();
  }
  return next({ name: "Login" });
});

export default router;
