import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/Auth/Login.vue";
import Register from "@/views/Auth/Register.vue";

const routes: Array<RouteRecordRaw> = [
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
