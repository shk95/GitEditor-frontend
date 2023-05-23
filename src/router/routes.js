const routes = [
  /*{
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: () => import('pages/IndexPage.vue')}
    ]
  },*/
  {
    path: '/',
    name: 'home',
    component: ()=>import('layouts/HomeLayout.vue')
  },
  {
    path: '/login',
    // name: 'longin',
    component: ()=>import('pages/LoginView.vue')
  },
  {
    path: '/oauth/redirect',
    name: 'oAuthRedirect',
    component: ()=>import('pages/RedirectView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('pages/Signup.vue')
  },
  {
    path: '/signup/oauth',
    name: 'oAuthRegister',
    component: () => import('pages/OauthRegisterView.vue')
  },
  {
    path: '/:user/config',
    name: 'userConfig',
    component: () => import('../modals/UserConfig.vue')
  },
  {
    path: '/findPwd',
    name: 'findPassword',
    component: () => import('../modals/UserFindPwd.vue')
  },
  {
    path: '/:user/list',
    name: 'list',
    component: () => import('pages/ListView.vue')
  },
  {
    path: '/:user/view/:file',
    name: 'userViewFile',
    component: () => import('pages/ViewMode.vue')
  },
  /*// otherwise redirect to home
  {path: '/:pathMatch(.*)*', redirect: '/'},*/

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
