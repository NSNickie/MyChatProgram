import { get, post, _delete, put } from '@/utils/request'

export default class Unit {
  static async getUnit(page) {
    return get('/productUnit', {
      page
    })
  }

  static async createUnit(code, uom) {
    return post('/productUnit', {
      code,
      uom
    })
  }

  static async updateUnit(code, uom, unitUid) {
    return put(`productUnit/${unitUid}`, {
      code,
      uom
    })
  }

  static async deleteUnit(unitUid) {
    return _delete(`productUnit/${unitUid}`)
  }
}
