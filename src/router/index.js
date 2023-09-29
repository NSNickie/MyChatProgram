import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import homeRoutes from './home'
import authRoutes from './auth'

let commonRoutes = [
  {
    path: '/',
    name: 'index',
    beforeEnter: (to, from, next) => {
      if (useUserStore().token) {
        next('/home')
      } else {
        next('/land')
      }
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404Page.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/500Page.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/404Page.vue')
  }
]

let routes = [].concat(homeRoutes, authRoutes, commonRoutes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  // auth
  // go to need token and supplier uid page
  if (to.meta.requiresAuth && !to.meta.notRequiresSupplierUid) {
    if (!userStore.token) {
      ElMessage({
        message: 'Please sign in first',
        type: 'warning'
      })
      next('/signin') //no token then go sign in
    } else if (!userStore.supplierUid) {
      next('/searchbusiness') //no supplier uid then go search business
    } else {
      next()
    }
    //go to need token but not supplier uid page
  } else if (to.meta.requiresAuth && to.meta.notRequiresSupplierUid) {
    if (!userStore.token) {
      ElMessage({
        message: 'Please sign in first',
        type: 'warning'
      })
      next('/signin') //no token then go sign in
    } else {
      next()
    }
  } else {
    next()
  }
})



export default router
