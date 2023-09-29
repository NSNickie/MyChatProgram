import { get, post, _delete,put } from '@/utils/request'

export default class Product {
  static async getProducts(name, description, category1Cid, page, perPage) {
    return get('/product', {
      name,
      description,
      category1Cid,
      page,
      perPage
    })
  }

  static async createProduct(
    category1Cid,
    catalog1Uid,
    name,
    currency,
    description,
    price,
    tax,
    stock,
    minOrderQuantity,
    unitId,
    images,
    productId
  ) {
    return post('/product', {
      category1Cid,
      catalog1Uid,
      name,
      currency,
      description,
      price,
      tax,
      stock,
      minOrderQuantity,
      unitId,
      images,
      productId
    })
  }

  static async updateProduct(
    category1Cid,
    name,
    currency,
    description,
    price,
    tax,
    stock,
    minOrderQuantity,
    unitId,
    images,
    productId,
    uid
  ) {
    return put(`/product/details/${uid}`, {
      category1Cid,
      name,
      currency,
      description,
      price,
      tax,
      stock,
      minOrderQuantity,
      unitId,
      images,
      productId
    })
  }

  static async deleteProduct(uid) {
    return _delete(`/product/details/${uid}`)
  }
}
