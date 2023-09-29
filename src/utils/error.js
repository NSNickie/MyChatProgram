import { useUserStore } from '../stores/user'
import { useCatalogStore } from '../stores/catalog'
import { useChatStore } from '../stores/chat'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'
import userAPI from '@/api/user'
import router from '@/router'
import dayjs from 'dayjs'

export function handleUnauthorizedError() {
  const userStore = useUserStore()
  const catalogStore = useCatalogStore()
  const chatStore = useChatStore()
  const orderStore = useOrderStore()
  if (!userStore.token) {
    return
  }
  ElMessage({
    message: 'Please login again'
  })
  chatStore.$reset()
  catalogStore.$reset()
  userStore.$reset()
  orderStore.$reset()
  router.push('/signin')
}

export async function refreshToken() {
  let userStore = useUserStore()
  let expiresTime = dayjs(userStore.loginAt).add(userStore.tokenExpiresIn, 'second')
  console.log(`token will expire at ${expiresTime}`)
  let result
  try {
    result = await userAPI.refreshToken(userStore.refreshToken)
    userStore.token = result.data.pkg.AccessToken
    userStore.loginAt = dayjs().format()
    userStore.tokenExpiresIn = result.data.pkg.ExpiresIn
    window.location.reload()
  } catch (error) {
    ElMessage({
      message: 'Refresh token failed!',
      type: 'error'
    })
    const userStore = useUserStore()
    const catalogStore = useCatalogStore()
    const chatStore = useChatStore()
    const orderStore = useOrderStore()
    chatStore.$reset()
    catalogStore.$reset()
    userStore.$reset()
    orderStore.$reset()
    router.push('/signin')
    console.log(error)
  }
}

export function handleInternalServerError() {
  router.push('/500')
}
