<template>
  <div class="common-layout">
    <el-container class="container">
      <el-aside class="aside" width="250px">
        <div class="aside-div">
          <div>
            <h1 class="logo">TAAB-SUPPLIER</h1>
            <div class="user">
              <el-avatar
                :src="
                  chatStore.avatarUrlPool[userStore.supplierAvatar]
                    ? chatStore.avatarUrlPool[userStore.supplierAvatar].url
                    : chatStore.avatarDefaultUrl
                "
              />
              <span class="font-sub-title">{{ userStore.businessName }}</span>
            </div>
            <el-menu
              :default-active="mainMenuPath"
              router
              active-text-color="#ffffff"
              background-color="transparent"
              class="menu font-sub-title"
            >
              <el-menu-item index="/chats">
                <el-icon><ChatLineRound /></el-icon>
                <span>Chats</span>
              </el-menu-item>

              <el-menu-item index="/orders">
                <el-icon><ShoppingCart /></el-icon>
                <span>Orders</span>
              </el-menu-item>

              <el-menu-item index="/customers">
                <el-icon><User /></el-icon>
                <span>Customers</span>
              </el-menu-item>

              <el-menu-item index="/catalogs">
                <el-icon><Folder /></el-icon>
                <span>Catalog</span>
              </el-menu-item>

              <el-menu-item index="/settings">
                <el-icon class="icon"><setting /></el-icon>
                <span>Settings</span>
              </el-menu-item>
              <!-- <el-menu-item index="/help">
                <el-icon><ChatSquare /></el-icon>
                <span>Get help</span>
              </el-menu-item> -->
            </el-menu>
          </div>
          <div class="foot">
            <div class="user">
              <el-avatar
                :src="
                  chatStore.avatarUrlPool[userStore.avatar]
                    ? chatStore.avatarUrlPool[userStore.avatar].url
                    : chatStore.avatarDefaultUrl
                "
              />
              <span class="font-sub-title"
                >{{ userStore.firstName + ' ' }}{{ userStore.lastName }}</span
              >
            </div>
            <div @click="signOut" class="el-menu-item">
              <el-icon><ArrowLeft /></el-icon>
              <span>Sign out</span>
            </div>
          </div>
        </div>
      </el-aside>
      <el-main>
        <div class="center">
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { Setting } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCatalogStore } from '@/stores/catalog'
import { useUrlStore } from '../stores/url'
import { useChatStore } from '../stores'
import { ElMessage, ElLoading } from 'element-plus'
import { computed, getCurrentInstance, onMounted } from 'vue'
import chatAPI from '@/api/chat'
import { useSocketStore } from '@/stores/socket'
import { useOrderStore } from '../stores/order'
import { initDB } from '@/utils/db'

const socketStore = useSocketStore()
const chatStore = useChatStore()
const router = useRouter()
const { proxy } = getCurrentInstance()
const mainMenuPath = computed(() => {
  if (useRoute().path.includes('/chats')) {
    return '/chats'
  }
  return useRoute().path
})

const urlStore = useUrlStore()
const catalogStore = useCatalogStore()
const userStore = useUserStore()
urlStore.route = useRoute()
function signOut() {
  useOrderStore().$reset()
  userStore.$reset()
  catalogStore.$reset()
  chatStore.$reset()
  urlStore.router = router

  ElMessage({
    message: 'Sign out',
    type: 'warning'
  })
  urlStore.websocketDisconnecting = ElLoading.service({
    lock: true,
    text: 'Disconnecting service...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  disconnectWebSocketUrl()

  // router.push('/signin')
}

onMounted(async () => {
  try {
    initDB(userStore.uid)
    urlStore.proxy = proxy
    urlStore.websocketConnecting = ElLoading.service({
      lock: true,
      text: 'Connecting service...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    await getWebSocketUrl()
    connectWebSocketUrl()
    chatStore.updateAvatarUrl(userStore.supplierAvatar)
    chatStore.updateAvatarUrl(userStore.avatar)
  } catch (error) {
    console.log(error)
    urlStore.websocketConnecting.close()
  }
})

async function getWebSocketUrl() {
  let result = await chatAPI.getWebSocketUrl()
  urlStore.websocketUrl = result.data.pkg.wssUrl
}

function connectWebSocketUrl() {
  if (proxy === null) return

  proxy.$connect(urlStore.websocketUrl)
}

function disconnectWebSocketUrl() {
  if (proxy === null) return
  if (!socketStore.isConnected) {
    if (urlStore.websocketDisconnecting.close()) {
      urlStore.websocketDisconnecting.close()
    }
    ElMessage({
      message: 'websocket connection has already been closed',
      type: 'warning'
    })
  }
  if (proxy) proxy.$disconnect(urlStore.websocketUrl)
}
</script>

<style scoped>
.container {
  height: 100vh;
}
.center {
  border-radius: 10px;
  background-color: aliceblue;
  height: 100%;
  /* display: flex;
  justify-content: center; 
  align-items: center; 
  flex-direction: column; */
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.aside {
  padding: 20px;
}

.menu {
  border-right: none;
}

.logo {
  font-weight: bolder;
  font-size: 27px;
  margin-bottom: 20px;
}

.user {
  padding: 0px 15px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  margin-top: 15px;
}

.user .el-avatar {
  margin-right: 5px;
}

.el-menu .el-icon {
  font-size: 30px;
  width: 30px;
  margin-right: 10px;
}

.aside-div {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.help {
  width: 100%;
  display: flex;
  align-items: center;
  height: var(--el-menu-item-height);
  line-height: var(--el-menu-item-height);
  font-size: var(--el-menu-item-font-size);
  color: var(--el-menu-text-color);
  padding: 0 var(--el-menu-base-level-padding);
  list-style: none;
  cursor: pointer;
  position: relative;
  transition: border-color var(--el-transition-duration),
    background-color var(--el-transition-duration), color var(--el-transition-duration);
  box-sizing: border-box;
}

.help .el-icon {
  font-size: 30px;
  width: 30px;
  margin-right: 10px;
}

.hover :hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.aside-div a {
  text-decoration: none;
}

.menu-item {
  display: flex;
  align-items: center;
  height: var(--el-menu-item-height);
  line-height: var(--el-menu-item-height);
  font-size: var(--el-menu-item-font-size);
  color: var(--el-menu-text-color);
  padding: 0 var(--el-menu-base-level-padding);
  list-style: none;
  cursor: pointer;
  position: relative;
  transition: border-color var(--el-transition-duration),
    background-color var(--el-transition-duration), color var(--el-transition-duration);
  box-sizing: border-box;
  white-space: nowrap;
}

.el-menu-item .el-icon {
  font-size: 30px;
  width: 30px;
  margin-right: 10px;
}

.el-menu-item {
  --el-menu-hover-bg-color: rgba(0, 0, 0, 0.2);
}
</style>
