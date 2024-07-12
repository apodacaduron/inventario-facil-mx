import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "@/config/router";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { vueQueryPluginOptions } from "./config/vue-query";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import * as Sentry from "@sentry/vue";

const pinia = createPinia();
const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://d712ea7326096cfe207695c5d94e5591@o235685.ingest.us.sentry.io/4507587033825280",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['*'],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.use(autoAnimatePlugin);
app.mount("#app");
