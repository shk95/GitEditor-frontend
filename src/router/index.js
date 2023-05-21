import { createRouter, createWebHistory } from 'vue-router'
import { HomeView, LoginView, RedirectView } from '@/views'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      // name: 'longin',
      component: LoginView
    },
    {
      path: '/oauth/redirect',
      name: 'oAuthRedirect',
      component: RedirectView
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/Signup.vue')
    },
    {
      path: '/signup/oauth',
      name: 'oAuthRegister',
      component: () => import('@/views/OauthRegisterView.vue')
    },
    {
      path: '/:user/config',
      name: 'userConfig',
      component: () => import('@/modals/UserConfig.vue')
    },
    {
      path: '/findPwd',
      name: 'findPassword',
      component: () => import('@/modals/UserFindPwd.vue')
    },
    {
      path: '/:user/list',
      name: 'list',
      component: () => import('@/views/ListView.vue')
    },
    {
      path: '/:user/view/:file',
      name: 'userViewFile',
      component: () => import('@/views/ViewMode.vue')
    },
    // otherwise redirect to home
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/signup', '/findPwd', '/oauth/redirect', '/signup/oauth']
  const authRequired = !publicPages.includes(to.path) // 해당 요청 페이지가 publicPages에 없으면 true => 로그인이 필요한 페이지
  const authStore = useUserStore()
  const user = storeToRefs(authStore) // TODO :user getter

  if (authRequired && !user.getToken) {
    return {
      path: '/login',
      query: { returnUrl: to.href }
    }
  }
})
