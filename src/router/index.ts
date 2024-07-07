import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/Auth/Login.vue";
import Register from "@/views/Auth/Register.vue";
import ProjectIndex from "@/views/Projects/ProjectIndex.vue";
import CreateFolder from "@/views/Projects/CreateFolder.vue";
import Canvas from "@/views/Projects/Canvas.vue";
import store from "@/store";
import ESPOAuthCallback from "@/views/ESP/ESPOAuthCallback.vue";
import Preview from "@/views/Projects/Preview.vue";
import ForgotPassword from "@/views/Auth/ForgotPassword.vue";
import ResetPassword from "@/views/Auth/ResetPassword.vue";
import EmailVerification from "@/views/Auth/EmailVerification.vue";

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
    path: "/forgot/password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/reset/password/:token",
    name: "ResetPassword",
    component: ResetPassword,
    props: true,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/email/verification/:token",
    name: "EmailVerification",
    component: EmailVerification,
    props: true,
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
  const jwt = localStorage.getItem("access-token");

  if (authUser && !authRequired) {
    return next({ name: "ProjectIndex" });
  }

  if (!authRequired) {
    return next();
  }

  if (authUser && jwt) {
    return next();
  }
  return next({ name: "Login" });
});

export default router;
