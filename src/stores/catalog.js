import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    masterCategory: [],
    masterCategoryHashTable: {},
    masterCategoryOptions: [],
    catalogs: [],
    category1: [],
    catalogUid: ''
  }),
  getters: {
    cascaderOptions: (state) => {
      let options = []
      let value = ''
      let label = ''
      let children = []
      let unit = {}
      let has00 = false
      for (let i = 0; i < state.category1.length; i++) {
        value = state.category1[i].cid
        if (value === '00') {
          has00 = true
        }
        label = state.category1[i].cname
        children = []
        unit = { value, label, children }
        switch (value.length) {
          case 2:
            options.push(unit)
            break
          case 4:
            for (let j = 0; j < options.length; j++) {
              if (options[j].value === value.substring(0, 2)) {
                options[j].children.push(unit)
              }
            }
            break
        }
      }
      if (!has00) {
        let unit = { value: '00', label: 'No Category' }
        options.unshift(unit)
      }
      return options
    },
    masterCategoryHash: (state) => {
      let hash = {}
      for (let i = 0; i < state.masterCategory.length; i++) {
        hash[state.masterCategory[i].categoryId] =
          state.masterCategory[i].category2 || state.masterCategory[i].category1
      }
      return hash
    },
    masterCascaderCategoryOptions: (state) => {
      let options = []
      let value = ''
      let label = ''
      let children = []
      let unit = {}
      for (let i = 0; i < state.masterCategory.length; i++) {
        value = state.masterCategory[i].categoryId
        if (value === '00') {
          continue
        }
        label = state.masterCategory[i].category2 || state.masterCategory[i].category1
        children = []
        unit = { value, label, children }
        switch (value.length) {
          case 2:
            options.push(unit)
            break
          case 4:
            for (let j = 0; j < options.length; j++) {
              if (options[j].value === value.substring(0, 2)) {
                options[j].children.push(unit)
              }
            }
            break
        }
      }
      return options
    }
  },
  actions: {},
  persist: true
})
