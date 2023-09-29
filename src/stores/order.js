import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    needRefreshOrders:false,
    needRefreshOrderDetail:false,
    needCloseOrderDetailDrawer:false,
    needRefreshOrdersList:false,
    favouriteProductsList: [],
    orderList: {},
    addProdcuatDrawerVisible: false,
    detailAddProdcuatDrawerVisible:false,
    orderChanged:false,
    orderDrawerVisible:false,
    detailDrawerVisible:false,
    ordersDetailList:{}
  }),
  getters: {},
  actions: {},
  persist: true
})
