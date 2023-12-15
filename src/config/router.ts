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
        name: "dashboard",
        meta: organizationMeta,
        component: () => import("@/pages/org/Dashboard.vue"),
      },
      {
        path: "products",
        name: "products",
        meta: organizationMeta,
        component: () => import("@/pages/org/Products.vue"),
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
        component: () => import("@/pages/auth/SignIn.vue"),
      },
      {
        path: "sign-up",
        meta: authMeta,
        component: () => import("@/pages/auth/SignUp.vue"),
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
  requiresAuth: (to, _from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!isLoggedIn()) {
        next("/auth/sign-in");
      } else {
        next();
      }
    } else {
      next();
    }
  },
  redirectIfLoggedIn: (to, _from, next) => {
    if (to.matched.some((record) => record.meta.redirectIfLoggedIn)) {
      if (isLoggedIn()) {
        next("/");
      } else {
        next();
      }
    } else {
      next();
    }
  },
  requiresOrganization: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.requiresOrganization)) {
      const userHasOrganizations = await hasOrganizations();

      if (!userHasOrganizations) {
        next("/no-organizations");
      } else {
        next();
      }
    } else {
      next();
    }
  },
  belongsToOrganization: async (to, _from, next) => {
    if (to.matched.some((record) => record.meta.belongsToOrganization)) {
      const orgId = to.params.orgId;

      const userBelongsToOrganization = await isUserAllowedInOrganization(
        orgId.toString()
      );

      if (!userBelongsToOrganization) {
        next("/unauthorized");
      } else {
        next();
      }
    } else {
      next();
    }
  },
};

router.beforeEach((to, from, next) => {
  const {
    requiresAuth,
    redirectIfLoggedIn,
    requiresOrganization,
    belongsToOrganization,
  } = navigationGuards;

  requiresAuth(to, from, () => {
    redirectIfLoggedIn(to, from, async () => {
      await requiresOrganization(to, from, async () => {
        await belongsToOrganization(to, from, next);
      });
    });
  });
});
