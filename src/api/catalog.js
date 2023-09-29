import { post, get } from '@/utils/request'

export default class Catalog {
  static async createCatalog() {
    return post('/catalog/')
  }

  static async getCatalogs(supplierUid) {
    return get('/catalog', {
      supplierUid
    })
  }

  static async getCategory(catalogUid) {
    return get('/category', {
      catalogUid
    })
  }

  static async getMasterCategory() {
    return get('/m-category')
  }

  static async createCategory(catalogUid,name,description,categories) {
    return post('/category',{
      catalogUid,
      name,
      description,
      categories
    })
  }
}
