import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import store from './stores/index'
import 'element-plus/dist/index.css'

import App from './App.vue'

import VueNativeSock from 'vue-native-websocket-vue3'
import { useUrlStore } from '@/stores/url'
import { useSocketStore } from '@/stores/socket'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.use(store)
const socketStore = useSocketStore()
const urlStore = useUrlStore()

app.mount('#app')

app.use(VueNativeSock, `${urlStore.websocketUrl}`, {
  // 启用pinia集成 | enable pinia integration
  store: socketStore,
  // 数据发送/接收使用使用json
  format: 'json',
  // 开启手动调用 connect() 连接服务器
  connectManually: true,
  // 开启自动重连
  reconnection: false,
  // 尝试重连的次数
  reconnectionAttempts: 5,
  // 重连间隔时间
  reconnectionDelay: 3000
})
export default app
