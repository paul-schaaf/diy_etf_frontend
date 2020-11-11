import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import EtfCreation from "../views/EtfCreation.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "EtfCreation",
    component: EtfCreation
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
