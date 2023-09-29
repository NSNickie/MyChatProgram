import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()
store.use(piniaPluginPersistedstate)

export * from './counter'
export * from './user'
export * from './catalog'
export * from './chat'
export * from './url'
export * from './order'
// export * from './socket'
export * from './record.js'
export default store
