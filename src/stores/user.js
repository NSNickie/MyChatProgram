import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    uid: '',
    supplierUid: '',
    avatar:'',
    supplierAvatar:'',
    firstName:'',
    lastName:'',
    businessName:'',
    isRememberMe:true,
    refreshToken:'',
    loginAt:'',
    refreshTokenTime:'',
    tokenExpiresIn:''

  }),
  getters: {
  },
  actions: {},
  persist: true
})
