import { useAuthStore } from "@/stores";
import { useOrganizationStore } from "@/stores/useOrganizationStore";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import {
  NavigationGuard,
  RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";

type RouteGuard = NavigationGuard;
type RouteWithMeta = RouteRecordRaw & {
  meta?: {
    requiresAuth?: boolean;
    redirectIfLoggedIn?: boolean;
    requiresOrganization?: boolean;
    belongsToOrganization?: boolean;
  };
};

const organizationMeta: RouteWithMeta["meta"] = {
  requiresAuth: true,
  requiresOrganization: true,
  belongsToOrganization: true,
};
const authMeta: RouteWithMeta["meta"] = {
  redirectIfLoggedIn: true,
};

export const routes: RouteWithMeta[] = [
  { path: "/", component: () => import("@/pages/Home.vue") },
  {
    path: "/org/:orgId",
    meta: organizationMeta,
    component: () =>
      import("@/features/organizations/components/OrgLayout.vue"),
    children: [
      {
        path: "dashboard",
        meta: organizationMeta,
        component: () => import("@/pages/org/dashboard.vue"),
      },
      {
        path: "products",
        meta: organizationMeta,
        component: () => import("@/pages/org/products.vue"),
      },
      {
        path: "sales",
        meta: organizationMeta,
        component: () => import("@/pages/org/sales.vue"),
      },
      {
        path: "customers",
        meta: organizationMeta,
        component: () => import("@/pages/org/customers.vue"),
      },
    ],
  },
  {
    path: "/auth",
    redirect: "/auth/sign-in",
    meta: authMeta,
    children: [
      {
        path: "sign-in",
        meta: authMeta,
        component: () => import("@/pages/auth/sign-in.vue"),
      },
      {
        path: "sign-up",
        meta: authMeta,
        component: () => import("@/pages/auth/sign-up.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

function isLoggedIn() {
  const authStore = useAuthStore();
  return authStore.isLoggedIn;
}
async function hasOrganizations() {
  const organizationStore = useOrganizationStore();
  const { hasOrganizations } = storeToRefs(organizationStore);

  await until(hasOrganizations).toBe(true);

  return organizationStore.hasOrganizations;
}
async function isUserAllowedInOrganization(orgId: string | undefined) {
  const organizationStore = useOrganizationStore();
  const { hasOrganizations } = storeToRefs(organizationStore);

  await until(hasOrganizations).toBe(true);

  return Boolean(
    organizationStore.organizations?.some(
      (organization) => organization.org_id === orgId
    )
  );
}

const navigationGuards: Record<string, RouteGuard> = {
  requiresAuth: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!isLoggedIn()) {
        next("/auth/sign-in");
        return;
      }
    }
    next();
  },
  redirectIfLoggedIn: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.redirectIfLoggedIn)) {
      if (isLoggedIn()) {
        next("/");
        return;
      }
    }
    next();
  },
  requiresOrganization: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.requiresOrganization)) {
      const userHasOrganizations = await hasOrganizations();
      if (!userHasOrganizations) {
        next("/no-organizations");
        return;
      }
    }
    next();
  },
  belongsToOrganization: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.belongsToOrganization)) {
      const orgId = to.params.orgId;
      const userBelongsToOrganization = await isUserAllowedInOrganization(
        orgId.toString()
      );
      if (!userBelongsToOrganization) {
        next("/unauthorized");
        return;
      }
    }
    next();
  },
};

router.beforeEach(async (to, _from, next) => {
  const guards = [
    navigationGuards.requiresAuth,
    navigationGuards.redirectIfLoggedIn,
    navigationGuards.requiresOrganization,
    navigationGuards.belongsToOrganization,
  ];

  for (const guard of guards) {
    await guard(to, _from, next);
    if (to !== router.currentRoute.value) return;
  }

  next();
});
