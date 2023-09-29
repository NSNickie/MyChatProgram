import { defineStore } from 'pinia'


export const useRecordStore = defineStore('record', {
  state: () => ({
    groupsLatestHaveReadTime:{}
  }),
  getters: {},
  actions: {},
  persist:true
})


