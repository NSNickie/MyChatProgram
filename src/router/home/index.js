import HomePage from '@/views/HomePage.vue'
import ChatBox from '@/components/ChatsPage/ChatBox.vue'

export default [
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    redirect: '/chats',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/chats',
        name: 'chats',
        component: () => import('@/views/home/ChatsPage.vue'),
        meta: {
          requiresAuth: true
        },
        children: [
          {
            path: '/chats/:groupUuid/:groupName',
            name: 'group',
            component: ChatBox,
            meta: {
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: '/orders',
        name: 'orders',
        component: () => import('@/views/home/OrdersPage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/customers',
        name: 'customers',
        component: () => import('@/views/home/CustomersPage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/catalogs',
        name: 'catalogs',
        component: () => import('@/views/home/CatalogPage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/home/SettingsPage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/help',
        name: 'help',
        component: () => import('@/views/home/HelpPage.vue'),
        meta: {
          requiresAuth: true
        }
      }
    ]
  }
]
