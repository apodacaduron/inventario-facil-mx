import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "@/config/router";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { vueQueryPluginOptions } from "./config/vue-query";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import VueGtag from "vue-gtag";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.use(autoAnimatePlugin);
app.use(
  VueGtag,
  {
    config: { id: "GTM-WT67JCKP" },
  },
  router
);
app.mount("#app");
