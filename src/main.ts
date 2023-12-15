import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "@/config/router";
import { createPinia } from "pinia";
import { VanillaComponents } from "@flavorly/vanilla-components";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  FcGoogle,
  MdLightmodeOutlined,
  MdDarkmodeOutlined,
} from "oh-vue-icons/icons";

addIcons(FcGoogle, MdLightmodeOutlined, MdDarkmodeOutlined);
const pinia = createPinia();
const app = createApp(App);

app.component("v-icon", OhVueIcon);
app.use(pinia);
app.use(router);
app.use(VanillaComponents);
app.mount("#app");
