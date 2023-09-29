import { defineStore } from 'pinia'

export const useBusinessStore = defineStore('business', {
  state: () => ({
    businessList: [],
    joinLoading:false,
  }),
  getters: {},
  actions: {},
  persist: true
})
