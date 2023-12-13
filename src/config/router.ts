import { useAuthStore } from "@/stores";
import { createRouter, createWebHistory } from "vue-router";

export const routes = [
  { path: "/", component: () => import("@/pages/Home.vue") },
  {
    path: "/dashboard",
    meta: { requiresAuth: true },
    component: () => import("@/pages/Dashboard.vue"),
  },
  {
    path: "/auth",
    redirect: "/auth/sign-in",
    children: [
      {
        path: "sign-in",
        component: () => import("@/pages/auth/SignIn.vue"),
      },
      {
        path: "sign-up",
        component: () => import("@/pages/auth/SignUp.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  console.log(to.meta.requiresAuth, authStore.isLoggedIn);

  if (to.meta.requiresAuth && !authStore.isLoggedIn) return "/auth/sign-in";
});
