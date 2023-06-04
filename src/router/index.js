import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import routes from "./routes";
import { storeToRefs } from "pinia";
import { useUserStore } from "stores/user";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store /*, ssrContext*/ }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // redirect to login page if not logged in and trying to access a restricted page
  Router.beforeEach(async (to, from, next) => {
    const authStore = useUserStore();
    // const publicPages = ['/login', '/signup', '/signup/oauth', '/findPwd', '/oauth/redirect', '/edit']
    // const authRequired = !publicPages.includes(to.path) // 해당 요청 페이지가 publicPages에 없으면 true => 로그인이 필요한 페이지

    const isLoggedIn = authStore.isUserLogin;
    const userRole = authStore.getRole;

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // 로그인 필요한 경로 접근
      const requiredRoles = to.meta.roles;
      if (isLoggedIn) {
        if (requiredRoles && requiredRoles.includes(userRole)) {
          next();
        } else {
          next({
            name: "tempLogin",
          });
        }
      } else {
        next("/login");
      }
    } else {
      // 로그인 필요하지 않음
      next();
    }
  });

  return Router;
});
