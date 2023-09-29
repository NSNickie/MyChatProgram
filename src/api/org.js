import { post, get } from '@/utils/request'
export default class Org {
  /**
   * Login
   * @param {String} email 邮箱
   * @param {String} password 密码
   * @returns
   */
  static async createSupplier(businessName, businessAddress, state, city, zipcode, phone) {
    return post('/org/', {
      businessName,
      businessAddress,
      state,
      city,
      zipcode,
      phone
    })
  }

  static async getSupplier(businessName, businessAddress, state, city, zipcode, phone, page) {
    return get('/org/', {
      businessName, 
      businessAddress,
      state,
      city,
      zipcode,
      phone,
      page
    })
  }

  static async getSupplierDetails(uid) {
    return get(`/org/details/${uid}`)
  }

  static async bindSupplier(supplierUid) {
    return post('/org-user/bind', {
      supplierUid
    })
  }

  static async getUserInfo(uid) {
    return get(`/org-user/details/${uid}`)
  }

  static async getStaff() {
    return get('/org/staff')
  }
}
