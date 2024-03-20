import { useRoleServices } from "@/features/global/composables/useRoleServices";
import { useAuthStore } from "@/stores";
import { useOrganizationStore } from "@/stores/useOrganizationStore";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import {
  RouteLocationNormalized,
  RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";

type RouteWithMeta = RouteRecordRaw & {
  meta?: {
    requiresAuth?: boolean;
    redirectIfLoggedIn?: boolean;
    requiresOrganization?: boolean;
    belongsToOrganization?: boolean;
  };
};

const adminMeta: RouteWithMeta["meta"] = {
  requiresAuth: true,
  hasAdminRole: true,
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
    path: "/admin",
    meta: adminMeta,
    component: () => import("@/features/admin/components/AdminLayout.vue"),
    children: [
      {
        path: "users",
        meta: adminMeta,
        component: () => import("@/pages/admin/users.vue"),
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

const navigationGuards = {
  requiresAuth: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!isLoggedIn()) {
        return "/auth/sign-in";
      }
    }
  },
  redirectIfLoggedIn: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.redirectIfLoggedIn)) {
      if (isLoggedIn()) {
        return "/";
      }
    }
  },
  requiresOrganization: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.requiresOrganization)) {
      const userHasOrganizations = await hasOrganizations();
      if (!userHasOrganizations) {
        return "/no-organizations";
      }
    }
  },
  belongsToOrganization: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.belongsToOrganization)) {
      const orgId = to.params.orgId;
      const userBelongsToOrganization = await isUserAllowedInOrganization(
        orgId.toString()
      );
      if (!userBelongsToOrganization) {
        return "/unauthorized";
      }
    }
  },
  hasAdminRole: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.hasAdminRole)) {
      const roleServices = useRoleServices();
      const roleResponse = await roleServices.getUserRole();

      const authStore = useAuthStore();
      authStore.setRole(roleResponse.data?.i_roles?.role_name);

      if (roleResponse.data?.i_roles?.role_name !== "admin") {
        return "/unauthorized";
      }
    }
  },
};

router.beforeEach(async (to, _from) => {
  const guards = [
    navigationGuards.requiresAuth,
    navigationGuards.redirectIfLoggedIn,
    navigationGuards.requiresOrganization,
    navigationGuards.belongsToOrganization,
    navigationGuards.hasAdminRole,
  ];

  for (const guard of guards) {
    const redirectPath = await guard(to);
    if (redirectPath) return redirectPath;
  }
});
