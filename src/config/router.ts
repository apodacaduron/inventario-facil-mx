import { useRoleServices } from "@/features/global/composables/useRoleServices";
import { useOrganizationServices } from "@/features/organizations/composables/useOrganizationServices";
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
import { analytics } from "./analytics";

type RouteWithMeta = RouteRecordRaw & {
  meta?: {
    requiresAuth?: boolean;
    redirectIfLoggedIn?: boolean;
    requiresOrganization?: boolean;
    belongsToOrganization?: boolean;
    requiresPublicProductsPageEnabled?: boolean;
    hasAdminRole?: boolean;
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
  { path: "/", component: () => import("@/pages/home.vue") },
  {
    path: "/unauthorized",
    component: () => import("@/pages/unauthorized.vue"),
  },
  {
    path: "/refund-policy",
    component: () => import("@/pages/legal/refund-policy.vue"),
  },
  {
    path: "/legal-notice",
    component: () => import("@/pages/legal/legal-notice.vue"),
  },
  {
    path: "/cookie-policy",
    component: () => import("@/pages/legal/cookie-policy.vue"),
  },
  {
    path: "/terms-and-conditions",
    component: () => import("@/pages/legal/terms-and-conditions.vue"),
  },
  {
    path: "/privacy-policy",
    component: () => import("@/pages/legal/privacy-policy.vue"),
  },
  {
    path: "/p/org/:orgId/products",
    meta: { requiresPublicProductsPageEnabled: true },
    component: () => import("@/pages/public/products.vue"),
  },
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
    path: "/settings",
    meta: { requiresAuth: true },
    component: () =>
      import("@/features/settings/components/SettingsLayout.vue"),
    children: [
      {
        path: "billing",
        meta: { requiresAuth: true },
        component: () => import("@/pages/settings/billing.vue"),
      },
      {
        path: "organizations",
        meta: { requiresAuth: true },
        component: () => import("@/pages/settings/organizations.vue"),
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
      {
        path: "subscriptions",
        meta: adminMeta,
        component: () => import("@/pages/admin/subscriptions.vue"),
      },
    ],
  },
  {
    path: "/auth",
    redirect: "/auth/sign-in",
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
      {
        path: "forgot",
        meta: authMeta,
        component: () => import("@/pages/auth/forgot.vue"),
      },
      {
        path: "update-password",
        component: () => import("@/pages/auth/update-password.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

async function isLoggedIn() {
  const authStore = useAuthStore();
  const { isLoadingSession } = storeToRefs(authStore);

  await until(isLoadingSession).toBe(false);

  return authStore.isLoggedIn;
}
async function hasUserOrganizations() {
  const organizationStore = useOrganizationStore();
  const { hasUserOrganizations, isUserOrganizationsLoading } =
    storeToRefs(organizationStore);

  await until(isUserOrganizationsLoading).toBe(false);
  await until(hasUserOrganizations).toBe(true);

  return organizationStore.hasUserOrganizations;
}
async function isUserAllowedInOrganization(orgId: string | undefined) {
  const organizationStore = useOrganizationStore();
  const { hasUserOrganizations, isUserOrganizationsLoading } =
    storeToRefs(organizationStore);

  await until(isUserOrganizationsLoading).toBe(false);
  await until(hasUserOrganizations).toBe(true);

  return Boolean(
    organizationStore.userOrganizations?.some(
      (organization) => organization.org_id === orgId
    )
  );
}

const navigationGuards = {
  requiresAuth: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!(await isLoggedIn())) {
        return "/auth/sign-in";
      }
    }
  },
  redirectIfLoggedIn: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.redirectIfLoggedIn)) {
      if (await isLoggedIn()) {
        return "/";
      }
    }
  },
  requiresOrganization: async (to: RouteLocationNormalized) => {
    if (to.matched.some((record) => record.meta.requiresOrganization)) {
      const userhasUserOrganizations = await hasUserOrganizations();
      if (!userhasUserOrganizations) {
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

      if (roleResponse.data?.i_roles?.role_name !== "admin") {
        return "/unauthorized";
      }
    }
  },
  requiresPublicProductsPageEnabled: async (to: RouteLocationNormalized) => {
    if (
      to.matched.some((record) => record.meta.requiresPublicProductsPageEnabled)
    ) {
      const organizationServices = useOrganizationServices();
      const response = await organizationServices.loadById({
        organization_id: to.params.orgId.toString(),
      });

      if (!response.data?.is_public_products_page_enabled || response.data.plans?.name === 'freemium') {
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
    navigationGuards.requiresPublicProductsPageEnabled,
  ];

  for (const guard of guards) {
    const redirectPath = await guard(to);
    if (redirectPath) return redirectPath;
  }
});

router.afterEach((to) => {
  analytics.pageView(to.fullPath);
});

router.onError((error, to) => {
  if (
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed")
  ) {
    if (!to?.fullPath) {
      window.location.reload();
    } else {
      window.location.href = to.fullPath;
    }
  }
});
