import { VueQueryPluginOptions } from "@tanstack/vue-query";

export const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 10_000,
      },
    },
  },
};
