import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "@/config/router";
import { createPinia } from "pinia";
import { VanillaComponents } from "@flavorly/vanilla-components";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VanillaComponents);
app.mount("#app");
