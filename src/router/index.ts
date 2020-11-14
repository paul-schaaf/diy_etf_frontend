import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import EtfCreation from "../views/EtfCreation.vue";
import BuyShares from "@/views/BuyShares.vue";
import RedeemShares from "@/views/RedeemShares.vue";
import Home from "@/views/Home.vue";

export const ROUTES = {
  HOME: "Home",
  ETFCREATION: "EtfCreation",
  BUYSHARES: "BuyShares",
  REDEEMSHARES: "RedeemShares"
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: ROUTES.HOME,
    component: Home
  },
  {
    path: "/create",
    name: ROUTES.ETFCREATION,
    component: EtfCreation
  },
  {
    path: "/buy-shares",
    name: ROUTES.BUYSHARES,
    component: BuyShares
  },
  {
    path: "/redeem-shares",
    name: ROUTES.REDEEMSHARES,
    component: RedeemShares
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
