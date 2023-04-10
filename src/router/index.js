import { createRouter, createWebHistory } from 'vue-router'
import EditMode from '@/views/EditMode.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: EditMode
    },
    {
      path: '/login',
      name: 'longin',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Login.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/Signup.vue')
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
      component: () => import('../views/ListView.vue')
    },
    {
      path: '/:user/view/:file',
      name: 'userViewFile',
      component: () => import('../views/ViewMode.vue')
    },
    {
      path: '/:user/edit/:file',
      name: 'userEditFile',
      component: EditMode
    }
  ]
})

export default router
