import LandingPage from '@/views/Auth/LandingPage.vue'

export default [
  {
    path: '/land',
    name: 'land',
    component: LandingPage,
    redirect: '/signin',
    children: [
      {
        path: '/signin',
        name: 'signin',
        component: () => import('@/views/Auth/SignIn.vue')
      },
      {
        path: '/signup',
        name: 'signup',
        component: () => import('@/views/Auth/SignUp.vue')
      },
      {
        path: '/verifycode/:email',
        name: 'verifycode',
        component: () => import('@/views/Auth/VerifyCode.vue')
      },
      {
        path: '/searchbusiness',
        name: 'searchbusiness',
        component: () => import('@/views/Auth/SearchBusiness.vue'),
        meta: {
          requiresAuth: true,
          notRequiresSupplierUid: true
        }
      },
      {
        path: '/businessresults',
        name: 'businessresults',
        component: () => import('@/views/Auth/BusinessResults.vue'),
        meta: {
          requiresAuth: true,
          notRequiresSupplierUid: true
        }
      },
      {
        path: '/registerbusiness',
        name: 'registerbusiness',
        component: () => import('@/views/Auth/RegisterBusiness.vue'),
        meta: {
          requiresAuth: true,
          notRequiresSupplierUid: true
        }
      },
    ]
  }
]
