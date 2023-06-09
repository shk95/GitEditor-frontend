const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("pages/HomePage.vue"),
  },
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/signup",
    component: () => import("layouts/SignupLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/signup/SignupPage.vue"),
      },
      {
        path: "oauth",
        component: () => import("pages/signup/SignupOAuthPage.vue"),
      },
    ],
  },
  {
    path: "/edit",
    component: () => import("pages/EditMode.vue"),
  },
  {
    path: "/user",
    component: () => import("layouts/UserLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["USER"],
    },
    children: [
      {
        path: "email",
        component: () => import("pages/user/config/UserChangeEmail.vue"),
        name: "tempLogin",
        meta: {
          requiresAuth: true,
          roles: ["TEMP"],
        },
      },
      {
        path: "info",
        component: () => import("pages/user/UserInfoPage.vue"),
        meta: {
          requiresAuth: true,
          roles: ["USER", "TEMP"],
        },
      },
      {
        path: "config",
        component: () => import("pages/user/UserConfigPage.vue"),
        meta: {
          requiresAuth: true,
          roles: ["USER"],
        },
      },
      {
        path: "repo",
        component: () => import("layouts/RepoLayout.vue"),
        meta: {
          requiresAuth: true,
          roles: ["USER"],
        },
        children: [
          {
            path: "",
            component: () => import("pages/user/repo/RepoListPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["USER"],
            },
          },
          {
            path: "edit",
            component: () => import("pages/user/repo/RepoEditPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["USER"],
            },
          },
        ],
      },
      {
        path: "stars",
        component: () => import("layouts/StarsLayout.vue"),
        meta: {
          requiresAuth: true,
          roles: ["USER"],
        },
        children: [
          {
            path: "",
            component: () => import("pages/user/stars/StarsListPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["USER"],
            },
          },
          {
            path: "search",
            component: () => import("pages/user/stars/StarsSearchPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["USER"],
            },
          },
        ],
      },
    ],
  },
  {
    path: "/findPwd",
    component: () => import("pages/UserFindPwdPage.vue"),
  },
  {
    path: "/oauth/redirect",
    component: () => import("pages/RedirectPage.vue"),
  },
  {
    path: "/redirect",
    name: 'redirect',
    component: () => import("pages/RedirectPage.vue"),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
