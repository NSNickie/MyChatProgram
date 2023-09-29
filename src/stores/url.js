import { defineStore } from 'pinia'
// import store from '@/stores'

export const useUrlStore = defineStore('url', {
  state: () => ({
    websocketUrl: 'websocket url',
    websocketConnecting: {},
    websocketDisconnecting: {},
    router: {},
    proxy:{},
    route:{}
  }),
  getters: {},
  actions: {},
})

// export function useUrlStoreWithOut() {
//   return useUrlStore(store)
// }

